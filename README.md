# 🎯 CTF IUT Nord Franche-Comté - R&T


Un CTF (Capture The Flag) éducatif pour découvrir la cybersécurité de manière ludique.

## 📋 Table des matières
- [Présentation](#-présentation)
- [Guide d'installation complet](#-guide-dinstallation-complet)
- [Déploiement Docker](#-déploiement-docker)
- [Configuration détaillée](#-configuration-détaillée)
- [Challenges et solutions](#-challenges-et-solutions)
- [Guide de dépannage](#-guide-de-dépannage)
- [Sécurité](#-sécurité)
- [Monitoring](#-monitoring)
- [Ressources pédagogiques](#-ressources-pédagogiques)
- [Support](#-support)

## 🛠 Guide d'installation complet

### Prérequis système
- Windows 10/11, macOS, ou Linux (Ubuntu 20.04+)
- 4GB RAM minimum
- 10GB espace disque

### 1. Installation de Node.js

#### Sur Windows
1. Télécharger Node.js sur [nodejs.org](https://nodejs.org/) (version LTS)
2. Exécuter l'installateur
3. Vérifier l'installation :
```bash
node --version
```

#### Sur Linux (Ubuntu/Debian)
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Sur macOS
```bash
brew install node
```

### 2. Installation de Python et Scapy

#### Sur Windows
1. Télécharger Python sur [python.org](https://www.python.org/) (version 3.8+)
2. Cocher "Add Python to PATH" pendant l'installation
3. Ouvrir PowerShell en administrateur et exécuter :
```bash
pip install scapy
```

#### Sur Linux
```bash
sudo apt update
sudo apt install python3 python3-pip
pip3 install scapy
```

#### Sur macOS
```bash
brew install python
pip3 install scapy
```

### 3. Installation de Wireshark

#### Sur Windows
1. Télécharger Wireshark sur [wireshark.org](https://www.wireshark.org/)
2. Installer avec les options par défaut

#### Sur Linux
```bash
sudo apt install wireshark
```

#### Sur macOS
```bash
brew install wireshark
```

### 4. Installation du projet
```bash
git clone https://github.com/votre-username/ctf-iut-rt.git
cd ctf-iut-rt
npm install
```

## 🐳 Déploiement Docker

### Pourquoi Docker ?
Docker permet de :
- Assurer une configuration identique sur tous les environnements
- Simplifier le déploiement
- Isoler l'application et ses dépendances
- Faciliter la mise à l'échelle

### Configuration Docker

#### Dockerfile
```dockerfile
# Image de base Node.js
FROM node:18-alpine

# Installer les dépendances nécessaires
RUN apk add --no-cache python3 make g++

# Installer Python et pip
RUN apk add --no-cache python3 py3-pip

# Installer les dépendances Python
RUN pip3 install Pillow piexif

# Créer le répertoire de l'application
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances avec une configuration plus sûre
RUN npm install --production --silent && \
    npm cache clean --force

# Copier le reste des fichiers de l'application
COPY . .

# Générer l'image du challenge 2
RUN python3 scripts/generate_challenge2_image.py

# Définir les variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Exposer le port 3000
EXPOSE 3000

# Démarrer l'application
CMD ["node", "app.js"]
```

#### .dockerignore
```text
node_modules
npm-debug.log
.git
.env
```

### Construction et déploiement

#### Construction locale
```bash
# Construire l'image
docker build -t ctf-iut-rt .

# Lancer le conteneur
docker run -p 3000:3000 ctf-iut-rt
```

#### Déploiement sur un serveur
```bash
# Tagger l'image
docker tag ctf-iut-rt votre-registry/ctf-iut-rt:latest

# Pousser l'image
docker push votre-registry/ctf-iut-rt:latest
```

#### Avec Docker Compose
```yaml
version: '3.8'
services:
  ctf:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

### Avantages de cette configuration
- **Reproductibilité** : Environnement identique partout
- **Isolation** : Pas de conflit avec d'autres applications
- **Sécurité** : Conteneur isolé et configuration minimale
- **Facilité de déploiement** : Une seule commande pour déployer
- **Scalabilité** : Facile à mettre à l'échelle horizontalement

### Maintenance
```bash
# Voir les logs
docker logs ctf-iut-rt

# Redémarrer le conteneur
docker restart ctf-iut-rt

# Mettre à jour
docker pull votre-registry/ctf-iut-rt:latest
docker stop ctf-iut-rt
docker rm ctf-iut-rt
docker run -d --name ctf-iut-rt -p 3000:3000 votre-registry/ctf-iut-rt:latest
```

## ⚙️ Configuration détaillée

### Structure des dossiers
```
ctf-iut-rt/
├── app.js  # Serveur principal
├── create_pcap.py  # Générateur PCAP
├── public/
│   ├── css/  # Styles
│   ├── js/  # Scripts
│   ├── images/  # Images
│   ├── files/  # Fichiers challenges
│   └── .html  # Pages challenges
└── README.md
```

### Configuration du serveur
1. Ouvrir `app.js`
2. Configurer le port (par défaut : 3000)
3. Vérifier les chemins statiques

### Génération des fichiers challenges
```bash
mkdir -p public/files
python create_pcap.py
chmod 755 public/files/
```

## 🎯 Challenges et solutions détaillées

### Challenge 1: Cryptographie
**Solution détaillée**:
```bash
echo "URYYB JBEYQ" | tr 'A-Za-z' 'N-ZA-Mn-za-m'
```
Flag: `FLAG{CRYPTO_EASY}`

### Challenge 2: Stéganographie
#### Génération de l'image
```python
from PIL import Image, ImageDraw, ImageFont
import piexif
import os

def create_challenge_image():
    # Obtenir le chemin absolu du projet
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    output_dir = os.path.join(project_root, 'public', 'images')
    
    # Créer une image simple
    width = 800
    height = 400
    image = Image.new('RGB', (width, height), color=(37, 99, 235))  # Bleu
    draw = ImageDraw.Draw(image)
    
    # Texte simple
    text = "Challenge #2\nStéganographie"
    font = ImageFont.load_default()
    
    # Centrer le texte
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    
    # Dessiner le texte
    draw.text((x, y), text, fill='white', font=font)
    
    try:
        # Créer le dossier de sortie si nécessaire
        os.makedirs(output_dir, exist_ok=True)
        
        # Chemin de sortie
        output_path = os.path.join(output_dir, 'challenge2.jpg')
        
        # Sauvegarder d'abord l'image sans EXIF
        image.save(output_path, "JPEG", quality=95)
        
        # Ajouter les métadonnées EXIF
        exif_dict = {
            "0th": {
                piexif.ImageIFD.Make: "IUT R&T".encode('utf-8'),
                piexif.ImageIFD.Software: "CTF Creator 1.0".encode('utf-8'),
            },
            "Exif": {
                piexif.ExifIFD.UserComment: "FLAG{IMAGE_SECRETE}".encode('utf-8')
            }
        }
        
        # Insérer les métadonnées EXIF
        exif_bytes = piexif.dump(exif_dict)
        piexif.insert(exif_bytes, output_path)
        
    except Exception as e:
        print(f"Erreur lors de la génération de l'image: {str(e)}")
        raise e
```

Pour générer l'image :
```bash
# Installer les dépendances
pip3 install Pillow piexif

# Exécuter le script
python3 scripts/generate_challenge2_image.py
```

#### Sur Windows
1. Télécharger ExifTool et l'extraire dans `C:\exiftool`
2. Ajouter au PATH

#### Sur Linux/MacOS
```bash
sudo apt install exiftool  # Linux
brew install exiftool  # macOS
```

### Challenge 3: Web
Outils nécessaires :
- Chrome/Firefox
- Extensions recommandées :
  - Vue Devtools
  - EditThisCookie

### Challenge 4: Réseau
**Configuration Wireshark** :
```bash
wireshark -X lua_script=scripts/http.lua
```

Filtres recommandés :
```
http.request.method == "POST"
tcp.port == 80
```

### Challenge 5: SQL
Base de données simulée :
```sql
CREATE TABLE users (
    id INT,
    username VARCHAR(50),
    password VARCHAR(50)
);
INSERT INTO users VALUES (1, 'admin', 'secret');
```

## 🔧 Guide de dépannage

1. **Le serveur ne démarre pas**
```bash
netstat -ano | findstr :3000  # Windows
taskkill /PID <pid> /F  # Windows
```

2. **Erreurs CORS**
```javascript
app.use(cors());
```

3. **Problèmes de permissions**
```bash
sudo chmod -R 755 public/
sudo chown -R $USER:$USER public/
```

## 🛡️ Sécurité

1. **Pare-feu**
```bash
netsh advfirewall firewall add rule name="CTF_Port" dir=in action=allow protocol=TCP localport=3000  # Windows
sudo ufw allow 3000  # Linux/macOS
```

2. **HTTPS (optionnel)**
```javascript
const https = require('https');
const fs = require('fs');
const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};
https.createServer(options, app).listen(3000);
```

## 📊 Monitoring

1. **Logs**
```javascript
const morgan = require('morgan');
app.use(morgan('combined'));
```

2. **PM2 pour exécuter en arrière-plan**
```bash
npm install -g pm2
pm2 start app.js
pm2 monit
```

## 🎓 Ressources pédagogiques

- [MDN Web Docs](https://developer.mozilla.org/)
- [Node.js Docs](https://nodejs.org/docs)
- [Express Guide](https://expressjs.com/guide)
- [Wireshark Docs](https://www.wireshark.org/docs/)

## 🤝 Support

- **GitHub Issues**
- **Email**: [anisse.fkaa@gmail.com](mailto:anisse.fkaa@gmail.com)
- **LinkedIn**: [https://www.linkedin.com/in/anisse-fouka-825b43254/](https://www.linkedin.com/in/anisse-fouka-825b43254/)

---
Créé avec ❤️ par **Anisse FOUKA - IUT Nord Franche-Comté 2024**# ctf_porte_ouverte
