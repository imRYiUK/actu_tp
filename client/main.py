#!/usr/bin/env python3
"""
Application client Python pour la gestion des utilisateurs via SOAP
Conforme à l'énoncé du projet d'architecture logicielle
"""

import requests
import json
import xml.etree.ElementTree as ET
from typing import Optional, Dict, Any, List
from zeep import Client
from zeep.transports import Transport
from zeep.plugins import HistoryPlugin

class UserManagementClient:
    def __init__(self, base_url: str = "http://localhost:8080"):
        self.base_url = base_url
        self.token: Optional[str] = None
        self.user_role: Optional[str] = None
        self.wsdl_url = f"{self.base_url}/ws/users.wsdl"
        
        # Initialiser le client Zeep pour le parsing SOAP
        try:
            self.history = HistoryPlugin()
            self.client = Client(self.wsdl_url, plugins=[self.history])
        except Exception as e:
            print(f"⚠️ Impossible de charger le WSDL, utilisation des requêtes HTTP directes: {e}")
            self.client = None
    
    def authenticate(self, username: str, password: str) -> bool:
        """Authentification via service SOAP"""
        try:
            # Appel au service SOAP d'authentification
            soap_url = f"{self.base_url}/ws"
            soap_body = f"""
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:usr="http://actu.com/users">
                <soapenv:Header/>
                <soapenv:Body>
                    <usr:loginRequest>
                        <usr:username>{username}</usr:username>
                        <usr:password>{password}</usr:password>
                    </usr:loginRequest>
                </soapenv:Body>
            </soapenv:Envelope>
            """
            
            headers = {
                'Content-Type': 'text/xml; charset=utf-8'
            }
            
            response = requests.post(soap_url, data=soap_body, headers=headers)
            
            if response.status_code == 200:
                # Parse la réponse SOAP pour extraire le token et les informations utilisateur
                try:
                    root = ET.fromstring(response.text)
                    # Chercher le token et les infos utilisateur dans la réponse
                    namespaces = {'ns2': 'http://actu.com/users'}
                    
                    token_elem = root.find('.//ns2:token', namespaces)
                    if token_elem is not None:
                        self.token = token_elem.text
                    
                    username_elem = root.find('.//ns2:username', namespaces)
                    role_elem = root.find('.//ns2:role', namespaces)
                    
                    if username_elem is not None and role_elem is not None:
                        self.user_role = role_elem.text
                        print(f"✅ Authentification réussie - Rôle: {self.user_role}")
                        return True
                    else:
                        print("❌ Authentification réussie mais informations utilisateur manquantes")
                        return False
                        
                except ET.ParseError as e:
                    print(f"❌ Erreur lors du parsing de la réponse: {e}")
                    return False
            else:
                print(f"❌ Échec de l'authentification - Status: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Erreur lors de l'authentification: {e}")
            return False
    
    def get_all_users(self) -> List[Dict[str, Any]]:
        """Récupérer la liste de tous les utilisateurs via SOAP"""
        if not self.token:
            print("❌ Token d'authentification requis")
            return []
        
        try:
            soap_body = f"""
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:usr="http://actu.com/users" xmlns:sec="http://actu.com/security">
                <soapenv:Header>
                    <sec:Authorization>Bearer {self.token}</sec:Authorization>
                </soapenv:Header>
                <soapenv:Body>
                    <usr:getAllUsersRequest/>
                </soapenv:Body>
            </soapenv:Envelope>
            """
            
            headers = {
                'Content-Type': 'text/xml; charset=utf-8'
            }
            
            response = requests.post(f"{self.base_url}/ws", data=soap_body, headers=headers)
            
            if response.status_code == 200:
                # Parse la réponse pour extraire la liste des utilisateurs
                try:
                    root = ET.fromstring(response.text)
                    namespaces = {'ns2': 'http://actu.com/users'}
                    
                    users = []
                    user_elements = root.findall('.//ns2:user', namespaces)
                    
                    for user_elem in user_elements:
                        user = {}
                        for child in user_elem:
                            tag = child.tag.replace('{http://actu.com/users}', '')
                            user[tag] = child.text
                        users.append(user)
                    
                    print(f"✅ {len(users)} utilisateurs récupérés")
                    return users
                    
                except ET.ParseError as e:
                    print(f"❌ Erreur lors du parsing de la réponse: {e}")
                    return []
            else:
                print(f"❌ Erreur lors de la récupération des utilisateurs - Status: {response.status_code}")
                return []
                
        except Exception as e:
            print(f"❌ Erreur: {e}")
            return []
    
    def create_user(self, username: str, email: str, password: str, role: str) -> bool:
        """Créer un nouvel utilisateur via SOAP"""
        if not self.token:
            print("❌ Token d'authentification requis")
            return False
        
        try:
            soap_body = f"""
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:usr="http://actu.com/users" xmlns:sec="http://actu.com/security">
                <soapenv:Header>
                    <sec:Authorization>Bearer {self.token}</sec:Authorization>
                </soapenv:Header>
                <soapenv:Body>
                    <usr:createUserRequest>
                        <usr:user>
                            <usr:username>{username}</usr:username>
                            <usr:email>{email}</usr:email>
                            <usr:password>{password}</usr:password>
                            <usr:role>{role}</usr:role>
                        </usr:user>
                    </usr:createUserRequest>
                </soapenv:Body>
            </soapenv:Envelope>
            """
            
            headers = {
                'Content-Type': 'text/xml; charset=utf-8'
            }
            
            response = requests.post(f"{self.base_url}/ws", data=soap_body, headers=headers)
            
            if response.status_code == 200:
                print("✅ Utilisateur créé avec succès")
                return True
            else:
                print(f"❌ Erreur lors de la création de l'utilisateur - Status: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Erreur: {e}")
            return False
    
    def update_user(self, user_id: int, username: str, email: str, password: str, role: str) -> bool:
        """Modifier un utilisateur via SOAP"""
        if not self.token:
            print("❌ Token d'authentification requis")
            return False
        
        try:
            soap_body = f"""
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:usr="http://actu.com/users" xmlns:sec="http://actu.com/security">
                <soapenv:Header>
                    <sec:Authorization>Bearer {self.token}</sec:Authorization>
                </soapenv:Header>
                <soapenv:Body>
                    <usr:updateUserRequest>
                        <usr:id>{user_id}</usr:id>
                        <usr:user>
                            <usr:username>{username}</usr:username>
                            <usr:email>{email}</usr:email>
                            <usr:password>{password}</usr:password>
                            <usr:role>{role}</usr:role>
                        </usr:user>
                    </usr:updateUserRequest>
                </soapenv:Body>
            </soapenv:Envelope>
            """
            
            headers = {
                'Content-Type': 'text/xml; charset=utf-8'
            }
            
            response = requests.post(f"{self.base_url}/ws", data=soap_body, headers=headers)
            
            if response.status_code == 200:
                print("✅ Utilisateur modifié avec succès")
                return True
            else:
                print(f"❌ Erreur lors de la modification de l'utilisateur - Status: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Erreur: {e}")
            return False
    
    def delete_user(self, user_id: int) -> bool:
        """Supprimer un utilisateur via SOAP"""
        if not self.token:
            print("❌ Token d'authentification requis")
            return False
        
        try:
            soap_body = f"""
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:usr="http://actu.com/users" xmlns:sec="http://actu.com/security">
                <soapenv:Header>
                    <sec:Authorization>Bearer {self.token}</sec:Authorization>
                </soapenv:Header>
                <soapenv:Body>
                    <usr:deleteUserRequest>
                        <usr:id>{user_id}</usr:id>
                    </usr:deleteUserRequest>
                </soapenv:Body>
            </soapenv:Envelope>
            """
            
            headers = {
                'Content-Type': 'text/xml; charset=utf-8'
            }
            
            response = requests.post(f"{self.base_url}/ws", data=soap_body, headers=headers)
            
            if response.status_code == 200:
                print("✅ Utilisateur supprimé avec succès")
                return True
            else:
                print(f"❌ Erreur lors de la suppression de l'utilisateur - Status: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Erreur: {e}")
            return False

    # --- Gestion des Tokens ---

    def get_all_tokens(self) -> List[Dict[str, Any]]:
        """Récupérer la liste de tous les tokens via SOAP"""
        if not self.token:
            print("❌ Token d'authentification requis")
            return []
        
        try:
            soap_body = f"""
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:usr="http://actu.com/users" xmlns:sec="http://actu.com/security">
                <soapenv:Header>
                    <sec:Authorization>Bearer {self.token}</sec:Authorization>
                </soapenv:Header>
                <soapenv:Body>
                    <usr:getAllTokensRequest/>
                </soapenv:Body>
            </soapenv:Envelope>
            """
            
            headers = {
                'Content-Type': 'text/xml; charset=utf-8'
            }
            
            response = requests.post(f"{self.base_url}/ws", data=soap_body, headers=headers)
            
            if response.status_code == 200:
                try:
                    root = ET.fromstring(response.text)
                    namespaces = {'ns2': 'http://actu.com/users'}
                    
                    tokens = []
                    token_elements = root.findall('.//ns2:token', namespaces)
                    
                    for token_elem in token_elements:
                        token = {}
                        for child in token_elem:
                            tag = child.tag.replace('{http://actu.com/users}', '')
                            token[tag] = child.text
                        tokens.append(token)
                    
                    print(f"✅ {len(tokens)} tokens récupérés")
                    return tokens
                    
                except ET.ParseError as e:
                    print(f"❌ Erreur lors du parsing de la réponse: {e}")
                    return []
            else:
                print(f"❌ Erreur lors de la récupération des tokens - Status: {response.status_code}")
                return []
                
        except Exception as e:
            print(f"❌ Erreur: {e}")
            return []

    def generate_token(self, user_id: int) -> Dict[str, Any]:
        """Générer un token pour un utilisateur via SOAP"""
        if not self.token:
            print("❌ Token d'authentification requis")
            return {}
        
        try:
            soap_body = f"""
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:usr="http://actu.com/users" xmlns:sec="http://actu.com/security">
                <soapenv:Header>
                    <sec:Authorization>Bearer {self.token}</sec:Authorization>
                </soapenv:Header>
                <soapenv:Body>
                    <usr:generateTokenRequest>
                        <usr:userId>{user_id}</usr:userId>
                    </usr:generateTokenRequest>
                </soapenv:Body>
            </soapenv:Envelope>
            """
            
            headers = {
                'Content-Type': 'text/xml; charset=utf-8'
            }
            
            response = requests.post(f"{self.base_url}/ws", data=soap_body, headers=headers)
            
            if response.status_code == 200:
                try:
                    root = ET.fromstring(response.text)
                    namespaces = {'ns2': 'http://actu.com/users'}
                    
                    token_elem = root.find('.//ns2:token', namespaces)
                    if token_elem is not None:
                        token = {}
                        for child in token_elem:
                            tag = child.tag.replace('{http://actu.com/users}', '')
                            token[tag] = child.text
                        print("✅ Token généré avec succès")
                        return token
                    else:
                        print("❌ Token non trouvé dans la réponse")
                        return {}
                        
                except ET.ParseError as e:
                    print(f"❌ Erreur lors du parsing de la réponse: {e}")
                    return {}
            else:
                print(f"❌ Erreur lors de la génération du token - Status: {response.status_code}")
                return {}
                
        except Exception as e:
            print(f"❌ Erreur: {e}")
            return {}

    def delete_token(self, token_id: int) -> bool:
        """Supprimer un token via SOAP"""
        if not self.token:
            print("❌ Token d'authentification requis")
            return False
        
        try:
            soap_body = f"""
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:usr="http://actu.com/users" xmlns:sec="http://actu.com/security">
                <soapenv:Header>
                    <sec:Authorization>Bearer {self.token}</sec:Authorization>
                </soapenv:Header>
                <soapenv:Body>
                    <usr:deleteTokenRequest>
                        <usr:id>{token_id}</usr:id>
                    </usr:deleteTokenRequest>
                </soapenv:Body>
            </soapenv:Envelope>
            """
            
            headers = {
                'Content-Type': 'text/xml; charset=utf-8'
            }
            
            response = requests.post(f"{self.base_url}/ws", data=soap_body, headers=headers)
            
            if response.status_code == 200:
                print("✅ Token supprimé avec succès")
                return True
            else:
                print(f"❌ Erreur lors de la suppression du token - Status: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Erreur: {e}")
            return False

    def get_tokens_by_user(self, user_id: int) -> List[Dict[str, Any]]:
        """Récupérer les tokens d'un utilisateur via SOAP"""
        if not self.token:
            print("❌ Token d'authentification requis")
            return []
        
        try:
            soap_body = f"""
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:usr="http://actu.com/users" xmlns:sec="http://actu.com/security">
                <soapenv:Header>
                    <sec:Authorization>Bearer {self.token}</sec:Authorization>
                </soapenv:Header>
                <soapenv:Body>
                    <usr:getTokensByUserRequest>
                        <usr:userId>{user_id}</usr:userId>
                    </usr:getTokensByUserRequest>
                </soapenv:Body>
            </soapenv:Envelope>
            """
            
            headers = {
                'Content-Type': 'text/xml; charset=utf-8'
            }
            
            response = requests.post(f"{self.base_url}/ws", data=soap_body, headers=headers)
            
            if response.status_code == 200:
                try:
                    root = ET.fromstring(response.text)
                    namespaces = {'ns2': 'http://actu.com/users'}
                    
                    tokens = []
                    token_elements = root.findall('.//ns2:token', namespaces)
                    
                    for token_elem in token_elements:
                        token = {}
                        for child in token_elem:
                            tag = child.tag.replace('{http://actu.com/users}', '')
                            token[tag] = child.text
                        tokens.append(token)
                    
                    print(f"✅ {len(tokens)} tokens récupérés pour l'utilisateur {user_id}")
                    return tokens
                    
                except ET.ParseError as e:
                    print(f"❌ Erreur lors du parsing de la réponse: {e}")
                    return []
            else:
                print(f"❌ Erreur lors de la récupération des tokens - Status: {response.status_code}")
                return []
                
        except Exception as e:
            print(f"❌ Erreur: {e}")
            return []

    def reactivate_token(self, token_id: int) -> bool:
        """Réactiver un token via SOAP"""
        if not self.token:
            print("❌ Token d'authentification requis")
            return False
        
        try:
            soap_body = f"""
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:usr="http://actu.com/users" xmlns:sec="http://actu.com/security">
                <soapenv:Header>
                    <sec:Authorization>Bearer {self.token}</sec:Authorization>
                </soapenv:Header>
                <soapenv:Body>
                    <usr:reactivateTokenRequest>
                        <usr:id>{token_id}</usr:id>
                    </usr:reactivateTokenRequest>
                </soapenv:Body>
            </soapenv:Envelope>
            """
            
            headers = {
                'Content-Type': 'text/xml; charset=utf-8'
            }
            
            response = requests.post(f"{self.base_url}/ws", data=soap_body, headers=headers)
            
            if response.status_code == 200:
                print("✅ Token réactivé avec succès")
                return True
            else:
                print(f"❌ Erreur lors de la réactivation du token - Status: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Erreur: {e}")
            return False

    def revoke_token(self, token_id: int) -> bool:
        """Révoquer un token via SOAP"""
        if not self.token:
            print("❌ Token d'authentification requis")
            return False
        
        try:
            soap_body = f"""
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:usr="http://actu.com/users" xmlns:sec="http://actu.com/security">
                <soapenv:Header>
                    <sec:Authorization>Bearer {self.token}</sec:Authorization>
                </soapenv:Header>
                <soapenv:Body>
                    <usr:revokeTokenRequest>
                        <usr:id>{token_id}</usr:id>
                    </usr:revokeTokenRequest>
                </soapenv:Body>
            </soapenv:Envelope>
            """
            
            headers = {
                'Content-Type': 'text/xml; charset=utf-8'
            }
            
            response = requests.post(f"{self.base_url}/ws", data=soap_body, headers=headers)
            
            if response.status_code == 200:
                print("✅ Token révoqué avec succès")
                return True
            else:
                print(f"❌ Erreur lors de la révocation du token - Status: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Erreur: {e}")
            return False

def display_main_menu():
    """Affiche le menu principal"""
    print("\n" + "=" * 60)
    print("📋 MENU PRINCIPAL - GESTION DES UTILISATEURS ET TOKENS")
    print("=" * 60)
    print("👥 GESTION DES UTILISATEURS:")
    print("  1. 📋 Lister tous les utilisateurs")
    print("  2. ➕ Créer un nouvel utilisateur")
    print("  3. ✏️  Modifier un utilisateur")
    print("  4. 🗑️  Supprimer un utilisateur")
    print("")
    print("🔑 GESTION DES TOKENS:")
    print("  5. 🔑 Lister tous les tokens")
    print("  6. ➕ Générer un token pour un utilisateur")
    print("  7. 🗑️  Supprimer un token")
    print("  8. 👤 Voir les tokens d'un utilisateur")
    print("  9. 🔄 Réactiver un token")
    print("  10. ❌ Révoquer un token")
    print("")
    print("⚙️  AUTRES:")
    print("  11. 🔄 Rafraîchir")
    print("  12. 🚪 Quitter")

def main():
    """Fonction principale de l'application client"""
    print("=" * 60)
    print("🔧 APPLICATION CLIENT - GESTION DES UTILISATEURS SOAP")
    print("=" * 60)
    
    client = UserManagementClient()
    
    # Demande d'authentification
    print("\n🔐 AUTHENTIFICATION")
    print("-" * 30)
    username = input("Nom d'utilisateur: ")
    password = input("Mot de passe: ")
    
    # Tentative d'authentification
    if not client.authenticate(username, password):
        print("❌ Échec de l'authentification.")
        return
    
    # Vérifier que l'utilisateur est ADMIN
    if client.user_role != "ADMIN":
        print(f"❌ Accès refusé. Rôle requis: ADMIN, votre rôle: {client.user_role}")
        return
    
    print(f"✅ Bienvenue {username} (ADMIN)")
    
    # Menu principal pour les administrateurs
    while True:
        display_main_menu()
        
        choice = input("\nVotre choix (1-12): ").strip()
        
        if choice == "1":
            print("\n📋 LISTE DES UTILISATEURS")
            print("-" * 40)
            users = client.get_all_users()
            if users:
                print(f"{'ID':<4} {'Username':<15} {'Email':<25} {'Rôle':<10}")
                print("-" * 60)
                for user in users:
                    user_id = user.get('id', 'N/A')
                    username = user.get('username', 'N/A')
                    email = user.get('email', 'N/A')
                    role = user.get('role', 'N/A')
                    print(f"{user_id:<4} {username:<15} {email:<25} {role:<10}")
            else:
                print("❌ Aucun utilisateur trouvé ou erreur de récupération")
        
        elif choice == "2":
            print("\n➕ CRÉER UN NOUVEL UTILISATEUR")
            print("-" * 30)
            new_username = input("Nom d'utilisateur: ").strip()
            new_email = input("Email: ").strip()
            new_password = input("Mot de passe: ").strip()
            print("Rôles disponibles: VISITOR, EDITOR, ADMIN")
            new_role = input("Rôle: ").strip().upper()
            
            if new_username and new_email and new_password and new_role:
                if client.create_user(new_username, new_email, new_password, new_role):
                    print("✅ Utilisateur créé avec succès!")
                else:
                    print("❌ Erreur lors de la création de l'utilisateur")
            else:
                print("❌ Tous les champs sont obligatoires")
        
        elif choice == "3":
            print("\n✏️ MODIFIER UN UTILISATEUR")
            print("-" * 30)
            try:
                user_id = int(input("ID de l'utilisateur à modifier: ").strip())
                new_username = input("Nouveau nom d'utilisateur (laisser vide pour ne pas changer): ").strip()
                new_email = input("Nouvel email (laisser vide pour ne pas changer): ").strip()
                new_password = input("Nouveau mot de passe (laisser vide pour ne pas changer): ").strip()
                print("Rôles disponibles: VISITOR, EDITOR, ADMIN")
                new_role = input("Nouveau rôle (laisser vide pour ne pas changer): ").strip().upper()
                
                # Utiliser les valeurs actuelles si non spécifiées
                if not new_username:
                    new_username = "unchanged"
                if not new_email:
                    new_email = "unchanged"
                if not new_password:
                    new_password = "unchanged"
                if not new_role:
                    new_role = "unchanged"
                
                if client.update_user(user_id, new_username, new_email, new_password, new_role):
                    print("✅ Utilisateur modifié avec succès!")
                else:
                    print("❌ Erreur lors de la modification de l'utilisateur")
            except ValueError:
                print("❌ ID utilisateur invalide")
        
        elif choice == "4":
            print("\n🗑️ SUPPRIMER UN UTILISATEUR")
            print("-" * 30)
            try:
                user_id = int(input("ID de l'utilisateur à supprimer: ").strip())
                confirm = input(f"⚠️ Êtes-vous sûr de vouloir supprimer l'utilisateur {user_id} ? (oui/non): ").strip().lower()
                if confirm in ['oui', 'o', 'yes', 'y']:
                    if client.delete_user(user_id):
                        print("✅ Utilisateur supprimé avec succès!")
                    else:
                        print("❌ Erreur lors de la suppression de l'utilisateur")
                else:
                    print("❌ Suppression annulée")
            except ValueError:
                print("❌ ID utilisateur invalide")
        
        elif choice == "5":
            print("\n🔑 LISTE DES TOKENS")
            print("-" * 30)
            tokens = client.get_all_tokens()
            if tokens:
                print(f"{'ID':<4} {'User ID':<8} {'Créé le':<20} {'Expire le':<20} {'Révoqué':<8}")
                print("-" * 70)
                for token in tokens:
                    token_id = token.get('id', 'N/A')
                    user_id = token.get('userId', 'N/A')
                    created_at = token.get('createdAt', 'N/A')[:19] if token.get('createdAt') else 'N/A'
                    expires_at = token.get('expiresAt', 'N/A')[:19] if token.get('expiresAt') else 'N/A'
                    revoked = token.get('revoked', 'N/A')
                    print(f"{token_id:<4} {user_id:<8} {created_at:<20} {expires_at:<20} {revoked:<8}")
            else:
                print("❌ Aucun token trouvé ou erreur de récupération")
        
        elif choice == "6":
            print("\n➕ GÉNÉRER UN TOKEN")
            print("-" * 30)
            try:
                user_id = int(input("ID de l'utilisateur pour lequel générer un token: ").strip())
                token = client.generate_token(user_id)
                if token:
                    print(f"✅ Token généré pour l'utilisateur {user_id}")
                    print(f"   ID: {token.get('id', 'N/A')}")
                    print(f"   Créé le: {token.get('createdAt', 'N/A')}")
                    print(f"   Expire le: {token.get('expiresAt', 'N/A')}")
                else:
                    print("❌ Erreur lors de la génération du token")
            except ValueError:
                print("❌ ID utilisateur invalide")
        
        elif choice == "7":
            print("\n🗑️ SUPPRIMER UN TOKEN")
            print("-" * 30)
            try:
                token_id = int(input("ID du token à supprimer: ").strip())
                confirm = input(f"⚠️ Êtes-vous sûr de vouloir supprimer le token {token_id} ? (oui/non): ").strip().lower()
                if confirm in ['oui', 'o', 'yes', 'y']:
                    if client.delete_token(token_id):
                        print("✅ Token supprimé avec succès!")
                    else:
                        print("❌ Erreur lors de la suppression du token")
                else:
                    print("❌ Suppression annulée")
            except ValueError:
                print("❌ ID token invalide")
        
        elif choice == "8":
            print("\n👤 TOKENS D'UN UTILISATEUR")
            print("-" * 30)
            try:
                user_id = int(input("ID de l'utilisateur: ").strip())
                tokens = client.get_tokens_by_user(user_id)
                if tokens:
                    print(f"Tokens pour l'utilisateur {user_id}:")
                    print(f"{'ID':<4} {'Créé le':<20} {'Expire le':<20} {'Révoqué':<8}")
                    print("-" * 60)
                    for token in tokens:
                        token_id = token.get('id', 'N/A')
                        created_at = token.get('createdAt', 'N/A')[:19] if token.get('createdAt') else 'N/A'
                        expires_at = token.get('expiresAt', 'N/A')[:19] if token.get('expiresAt') else 'N/A'
                        revoked = token.get('revoked', 'N/A')
                        print(f"{token_id:<4} {created_at:<20} {expires_at:<20} {revoked:<8}")
                else:
                    print(f"❌ Aucun token trouvé pour l'utilisateur {user_id}")
            except ValueError:
                print("❌ ID utilisateur invalide")
        
        elif choice == "9":
            print("\n🔄 RÉACTIVER UN TOKEN")
            print("-" * 30)
            try:
                token_id = int(input("ID du token à réactiver: ").strip())
                if client.reactivate_token(token_id):
                    print("✅ Token réactivé avec succès!")
                else:
                    print("❌ Erreur lors de la réactivation du token")
            except ValueError:
                print("❌ ID token invalide")
        
        elif choice == "10":
            print("\n❌ RÉVOQUER UN TOKEN")
            print("-" * 30)
            try:
                token_id = int(input("ID du token à révoquer: ").strip())
                confirm = input(f"⚠️ Êtes-vous sûr de vouloir révoquer le token {token_id} ? (oui/non): ").strip().lower()
                if confirm in ['oui', 'o', 'yes', 'y']:
                    if client.revoke_token(token_id):
                        print("✅ Token révoqué avec succès!")
                    else:
                        print("❌ Erreur lors de la révocation du token")
                else:
                    print("❌ Révocation annulée")
            except ValueError:
                print("❌ ID token invalide")
        
        elif choice == "11":
            print("🔄 Rafraîchissement...")
            # Option pour rafraîchir la liste
            continue
        
        elif choice == "12":
            print("👋 Au revoir!")
            break
        
        else:
            print("❌ Choix invalide. Veuillez choisir entre 1 et 12.")
        
        # Pause après chaque action pour permettre à l'utilisateur de voir le résultat
        input("\nAppuyez sur Entrée pour continuer...")

if __name__ == "__main__":
    main() 