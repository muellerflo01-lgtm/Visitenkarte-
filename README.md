# Die ehrliche Visitenkarte – KI-Version 4

500 × 500 px Visitenkarten-Generator mit Foto-Upload, Mann/Frau/Bär, KI-generiertem Comic und **KI-Button direkt unter „Was machst du eigentlich oft?“**. Der Vorschlag wird aus dem offiziellen Jobtitel generiert und kann durch erneutes Klicken variiert werden.

## Schnellstart auf Netlify (empfohlen: GitHub)

1. ZIP entpacken. Die Dateien `index.html`, `netlify.toml` und der Ordner `netlify/` müssen im **Root** deines GitHub-Repositories liegen. Erstelle ein neues GitHub-Repository und lade die entpackten Dateien hoch.
2. Auf https://app.netlify.com/ → **Add new project → Import an existing project → GitHub** → Repository auswählen. Publish directory `.`; die Einstellungen kommen aus `netlify.toml`. Deploy auslösen.
3. Unter **Project configuration → Environment variables** `OPENAI_API_KEY` als geheimen Wert anlegen (OpenAI API-Schlüssel von https://platform.openai.com/api-keys). Danach **Deploys → Trigger deploy**. Ein ChatGPT-Abo beinhaltet nicht automatisch API-Guthaben.
4. Netlify-URL öffnen und **Lustige Idee vorschlagen (KI)** sowie **KI-Comic generieren** testen.

**Wichtig:** Netlify Drop (reines Drag & Drop einer statischen ZIP) stellt die benötigten Functions nicht zuverlässig bereit. Für KI bitte GitHub-Import wie oben oder Netlify CLI mit Functions-Deployment verwenden. Die ZIP ist GitHub-fertig und benötigt weder npm install noch Build-Skript.

## Technisches / Sicherheit

- Textvorschläge: `netlify/functions/suggest.js`, OpenAI Chat Completions API (`gpt-4.1-mini`, optional über `OPENAI_TEXT_MODEL` anpassbar).
- Comics: `netlify/functions/generate.js`, OpenAI Images API (`gpt-image-1`).
- API-Schlüssel nur in Netlify-Umgebungsvariablen, **niemals** im HTML oder Repository.
- Fotos werden lokal verarbeitet und nicht an die KI übertragen. Beruf und ehrliche Tätigkeit werden für die Bilderzeugung an OpenAI übermittelt; für den Textvorschlag nur der Job.
- **Vor öffentlichem LinkedIn-Launch**: Bot-Schutz, persistentes Rate-Limiting und API-Budgetüberwachung ergänzen. Diese Version enthält Eingabevalidierung, aber noch keinen verlässlichen Schutz vor Massenanfragen. Jeder Aufruf kann Kosten auslösen.
- Die KI-Funktionen wurden hier nicht mit einem echten API-Schlüssel getestet; die tatsächliche Ausführung hängt von Netlify Functions-Laufzeit, API-Zugang und Guthaben ab.
