import time
import requests

# Configuración inicial
url_base = "https://hackeps-poke-backend.azurewebsites.net/events/"  # URL base de la API
zone_ids = [
    "67372c39c499cd12be6bef9e", "67372c61f269e28d2f86f063",
    "67372c56ec018d7dedd34ee3", "6737278e28aebf267e089bec",
    "67372c44db061db993104ce1", "67372c1c7a5c6e90024299e1",
    "67372c23ea45b856683249f4", "6710c41ed814fc8dae914171",
    "67372c4a591a6cbabccfc012", "67372c2a2219842167aa3e0c",
    "67372c31f895d5d1b4d6c2a9"
]  # Lista de IDs de zona
intervalo_total_segundos = 600  # 10 minutos en segundos

# Body fijo para la solicitud POST
payload = {
    "team_id": "63bf06cf-e720-4134-9252-f195668c6048"
}

# Headers (si la API requiere autenticación o algún encabezado especial)
headers = {
    "Content-Type": "application/json",
    # Si la API requiere un token de autenticación, descomenta y reemplaza el siguiente encabezado
    # "Authorization": "Bearer YOUR_ACCESS_TOKEN"
}

# Función para realizar la solicitud
def realizar_request(zone_id):
    url = f"{url_base}{zone_id}"
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()  # Lanza una excepción para códigos HTTP de error
        print(f"Request a {url} exitosa: {response.status_code}")
        print(f"Respuesta: {response.json()}")  # Si la respuesta es JSON
    except requests.exceptions.RequestException as e:
        print(f"Error al realizar la request a {url}: {e}")

# Bucle principal
def main():
    while True:
        inicio_ciclo = time.time()

        # Realizar solicitudes consecutivas a todas las zonas
        for zone_id in zone_ids:
            realizar_request(zone_id)

        # Calcular cuánto tiempo esperar para completar el intervalo de 10 minutos
        duracion_ciclo = time.time() - inicio_ciclo
        tiempo_restante = max(0, intervalo_total_segundos - duracion_ciclo)

        # Contador en tiempo real para el próximo ciclo
        print("\nEsperando para el próximo ciclo...")
        while tiempo_restante > 0:
            mins, secs = divmod(int(tiempo_restante), 60)
            print(f"Tiempo hasta el próximo ciclo: {mins:02d}:{secs:02d}", end="\r", flush=True)
            time.sleep(1)
            tiempo_restante -= 1

        print("\nIniciando nuevo ciclo...\n")

if __name__ == "__main__":
    main()
