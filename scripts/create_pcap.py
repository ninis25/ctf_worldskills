from scapy.all import *

# Créer la requête HTTP
http_payload = (
    b"POST /login HTTP/1.1\r\n"
    b"Host: challenge.ctf\r\n"
    b"Content-Type: application/x-www-form-urlencoded\r\n"
    b"Content-Length: 37\r\n"
    b"\r\n"
    b"username=admin&password=FLAG{NETWORK_TRAFFIC}"
)

# Créer les paquets
ip = IP(src="192.168.1.10", dst="192.168.1.20")
tcp = TCP(sport=54321, dport=80, flags="PA")
packet = ip/tcp/http_payload

# Créer le dossier files s'il n'existe pas
import os
if not os.path.exists("public/files"):
    os.makedirs("public/files")

# Écrire dans un fichier pcap
wrpcap("public/files/capture_reseau.pcap", packet)

print("Fichier PCAP créé avec succès !") 