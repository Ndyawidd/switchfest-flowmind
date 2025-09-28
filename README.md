# FlowMind 🧠

**Your Digital Companion for a Balanced Mind**

FlowMind is a web app that helps you **track your mood, organize tasks, and record ideas** in a modern and simple interface. With FlowMind, you can be more productive and more mindful of your daily life.

---

## ✨ Key Features

* 🌈 **Mood Tracker** → Track your daily mood with emojis and descriptions. See your emotional patterns in an interactive calendar view.
* ✅ **To-Do List** → Easily add, mark complete, and organize tasks by date.
* 📝 **Smart Notes** → Save quick ideas in text or voice (auto transcription).
* 📊 **Dashboard Personal** → View a summary of your latest moods, tasks, and notes right from the homepage.
* 🤖 **Summarize** → Summarize long notes into short ones with the help of AI.

---

## 🛠️ Teknologi

* ⚛️ **Next.js 14** (React 19 + TypeScript)
* 🎨 **Tailwind CSS** + Framer Motion
* 🔐 **Supabase** (Database, Auth, Storage)
* ▲ **Vercel** (Deployment)

---

## 🚀 Instalasi

1. **Clone repo**

   ```bash
   git clone https://github.com/username/flowmind.git
   cd flowmind
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup Supabase**

   * Create a new project at [Supabase](https://supabase.com/).
   * Create table `mood_entries`, `todos`, `notes` (Enable Row Level Security + policies).
   * Create a `notes_images` bouquet to store images. 
   * Copy **URL** & **Anon Key** Supabase.

4. **Buat file `.env.local`**

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

5. **Jalankan project**

   ```bash
   npm run dev
   ```

6. **Akses di browser** → [http://localhost:3000](http://localhost:3000)

---

## 📂 Struktur Project

```
flowmind/
│── app/             # Next.js App Router
│   ├── layout.tsx   # Main layout
│   ├── page.tsx     # Landing page
│   ├── notes/       # Notes page
│   ├── toDoList/    # To-do page
│   ├── moodTracker/ # Mood tracker page
│   └── summarize/   # Summarize page
│
│── components/      # Reusable components (Navbar, Footer, etc)
│── lib/             # Supabase client & helper
│── public/          # Static assets (logo, picture)
│── styles/          # Global styles / Tailwind
│── README.md        # Project documentation
```

---

## 🤝 Contribusion

Contributions are very open 🚀

1. Fork this repo
2. Create a new branch (`git checkout -b new-feature`)
3. Commit the changes (`git commit -m 'Add feature X'`)
4. Push ke branch (`git push origin new-feature`)
5. Create a Pull Request

---

## 📜 License

License **MIT** © 2025 - FlowMind

---

⭐️ Don't forget to star this repo if you find it useful!
