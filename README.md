# Nieuwspijp

Nieuwspijp is een kleine statische website voor satirische nieuwsartikelen. Er is geen database, backend of betaald beheersysteem. Ieder artikel staat in één overzichtelijk gegevensbestand; de website maakt daar automatisch de homepage en artikelpagina van.

## Website lokaal bekijken

1. Open deze projectmap in Codex.
2. Vraag Codex: **“Bouw Nieuwspijp en open de lokale website.”**
3. Codex voert de controle uit en opent het lokale adres.

Voor wie zelf een terminal wil gebruiken:

```text
npm run build
npm start
```

Open daarna `http://127.0.0.1:4173` in de browser. Stop de lokale website met `Ctrl+C` in de terminal.

## Nieuw artikel toevoegen

Lever per artikel aan:

- de definitieve titel;
- categorie;
- publicatiedatum;
- definitieve artikeltekst;
- eventueel een korte intro;
- gewenste URL-naam (slug);
- de definitieve afbeelding en een korte beschrijving daarvan voor bezoekers die de afbeelding niet kunnen zien.

Vraag Codex vervolgens om het artikel toe te voegen. Codex plaatst de afbeelding in `src/assets/images`, maakt in `content/articles` één JSON-bestand en controleert de uitkomst. Artikelteksten worden niet zelfstandig herschreven of gecorrigeerd.

Een artikelbestand heeft deze vorm:

```json
{
  "slug": "didgeridoo-orgelregister",
  "title": "Orgelbouwers onderzoeken nieuw register: de didgeridoo",
  "category": "Cultuur",
  "date": "2026-09-01",
  "image": "assets/images/bestandsnaam.jpg",
  "imageAlt": "Korte feitelijke beschrijving van de afbeelding",
  "intro": "Optionele korte intro",
  "body": [
    "Eerste definitieve alinea.",
    "Tweede definitieve alinea."
  ]
}
```

De slug gebruikt alleen kleine letters, cijfers en koppeltekens. Daarmee ontstaat bijvoorbeeld de URL `/artikelen/didgeridoo-orgelregister/`.

## Artikel wijzigen

De tekst en gegevens staan in het bijbehorende bestand in `content/articles`. Pas alleen het gewenste veld aan en laat daarna opnieuw bouwen en controleren. Na een wijziging op GitHub publiceert Cloudflare Pages automatisch de nieuwe versie.

## Afbeeldingen

Bewaar afbeeldingen in `src/assets/images`. Gebruik bij voorkeur JPG of WebP en een duidelijke bestandsnaam met kleine letters en koppeltekens. Vul in het artikelbestand bij `image` het pad `assets/images/bestandsnaam.jpg` in. De originele aangeleverde afbeelding wordt niet inhoudelijk vervangen zonder toestemming.

## Publiceren

De hoofdversie van de website staat straks op GitHub. Cloudflare Pages wordt één keer met die GitHub-repository verbonden. Daarna is de normale werkwijze:

1. artikel of afbeelding toevoegen of wijzigen;
2. lokaal laten bouwen en controleren;
3. de wijziging naar GitHub sturen;
4. Cloudflare Pages bouwt en publiceert automatisch.

Instellingen voor Cloudflare Pages:

- productiesectie: `main`;
- build-opdracht: `npm run build`;
- uitvoermap: `dist`;
- Node.js: een actuele LTS-versie.

De map `dist` wordt automatisch gemaakt en hoort daarom niet in Git.
