# 🎾 PadelBook

Aplicació web per a la gestió de reserves de pistes de pàdel.

PadelBook permet als usuaris consultar disponibilitat, reservar pistes i gestionar les seves reserves de manera fàcil i intuïtiva, amb una experiència moderna i coherent amb una aplicació real.

---

## ✨ Què és PadelBook?

PadelBook és una aplicació web pensada per simplificar la gestió de reserves de pistes de pàdel, tant per usuaris com per administradors.

L’objectiu principal és oferir una experiència clara, ràpida i realista, amb una interfície que s’apropa al comportament d’una aplicació comercial.

---

## 🚀 Funcionalitats

### 👤 Usuari

* Registre i login amb autenticació JWT
* Consulta de disponibilitat per data
* Reserva de pistes amb selecció d’hores
* Visualització d’historial de reserves
* Cancel·lació de reserves
* Eliminació definitiva de reserves cancel·lades

Cada reserva inclou:

* Codi de reserva
* Preu total
* Mètode de pagament
* Estat del pagament

---

### 👑 Administrador

* Visualització global de reserves
* Filtres avançats (data, usuari, pista, estat...)
* Estadístiques del sistema
* Logs administratius
* Exportació a CSV

---

## 🧠 Experiència d’usuari

PadelBook no és només funcional, està pensat com una aplicació real:

* ✔ Feedback visual a totes les accions
* ✔ Prevenció d’errors d’usuari
* ✔ Interfície responsive
* ✔ Components reutilitzables
* ✔ Flux de reserva clar i intuïtiu

---

## 🛠️ Stack tecnològic

### Frontend

* React + Vite
* CSS personalitzat
* Axios

### Backend

* Node.js + Express
* MySQL

### Altres

* JWT per autenticació
* Sistema d’emails automàtics

---

## 📂 Estructura del projecte

```bash
PadelBook/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   └── config/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   └── styles/
│
└── database/
```

---

## ⚙️ Instal·lació

### 1. Clonar repositori

```bash
git clone https://github.com/pereeserra/padelbook.git
cd padelbook
```

---

### 2. Backend

```bash
cd backend
npm install
```

Crear `.env`:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=padelbook
JWT_SECRET=secret
```

Executar:

```bash
npm run dev
```

---

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔌 API resum

| Endpoint                           | Descripció            |
| ---------------------------------- | --------------------- |
| POST /auth/login                   | Login                 |
| POST /auth/register                | Registre              |
| GET /availability                  | Disponibilitat        |
| POST /reservations                 | Crear reserva         |
| GET /reservations                  | Llistar reserves      |
| DELETE /reservations/:id           | Cancel·lar reserva    |
| DELETE /reservations/:id/permanent | Eliminació definitiva |

---

## 💳 Sistema de pagament

Pagament simulat:

* `online_simulat` → pagat
* `al_club` → pendent

---

## 📈 Estat del projecte

✔ Backend complet
✔ Frontend avançat
✔ Integració completa
✔ UX millorada

---

## 🔮 Roadmap

* [ ] Integració amb pagaments reals
* [ ] Notificacions en temps real
* [ ] Aplicació mòbil
* [ ] Sistema de valoracions
* [ ] Multi-club

---

## 👨‍💻 Autor

Projecte desenvolupat dins el cicle DAW.

---

## 📄 Llicència

Projecte amb finalitats educatives.