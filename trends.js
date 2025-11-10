const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

const API_KEY = 'AIzaSyDAQVkMZ_l73dK7pt9gaccYPn5L0vA3PGw'; // Cambia por tu API Key válida

app.use(cors()); // Permite peticiones desde cualquier origen (para desarrollo)

app.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Falta parámetro q' });

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(query)}&key=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});
