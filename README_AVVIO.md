# Biblioteca Neunoi - Istruzioni Avvio

## 1. Avvio Applicazione
Per avviare sia il Frontend che il Backend contemporaneamente:

1. Apri un terminale nella cartella principale (`biblioteca-neunoi`).
2. Se usi **PowerShell** e ricevi un errore rosso ("esecuzione di script disabilitata"), usa uno di questi due metodi:
   - **Metodo A (Consigliato)**: Scrivi `cmd` nel terminale per passare al Prompt dei Comandi, poi esegui:
     ```cmd
     npm run dev
     ```
   - **Metodo B (Bypass)**: Esegui questo comando direttamente in PowerShell:
     ```powershell
     powershell -ExecutionPolicy Bypass -Command "npm run dev"
     ```

3. Il Backend partirà sulla porta **5001**.
4. Il Frontend partirà sulla porta **5173**.

## 2. Accesso Locale (PC Sviluppo)
Apri il browser e vai su:
- **http://localhost:5173** o **http://127.0.0.1:5173**

## 3. Accesso da WiFi (Smartphone/Tablet)
Per accedere da altri dispositivi connessi allo stesso WiFi:

1. Trova l'indirizzo IP del tuo computer:
   - Apri un terminale e scrivi `ipconfig` (Windows).
   - Cerca la voce **Indirizzo IPv4** sotto la scheda Wireless o Ethernet (es. `192.168.1.XX`).

2. Dal telefono, apri il browser e vai su:
   - **http://192.168.1.XX:5173** (Sostituisci le XX con i numeri del tuo IP).

## 4. Credenziali Admin
- **Email**: `admin@neunoi.it`
- **Password**: `password123`

## 5. Funzionalità da Testare
- [ ] Registrazione nuovo utente.
- [ ] Login.
- [ ] Ricerca libro nel catalogo.
- [ ] Richiesta prestito (verifica che le copie diminuiscano).
- [ ] Dashboard Admin (Approva prestito).
- [ ] Verifica email (guarda la console dove gira il server per il link Ethereal).
