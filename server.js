const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Store RSVPs in memory (in production, use a database)
const rsvps = [];

// RSVP endpoint
app.post('/api/rsvp', (req, res) => {
  const { name, guests, message, attending } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  const rsvp = {
    id: Date.now(),
    name,
    guests: guests || 1,
    message: message || '',
    attending: attending !== false,
    createdAt: new Date().toISOString()
  };

  rsvps.push(rsvp);
  console.log(`✨ Novo RSVP: ${rsvp.name} - ${rsvp.attending ? 'Confirmado' : 'Não poderá ir'}`);
  
  res.json({ success: true, message: 'Confirmação recebida com sucesso!' });
});

// Get RSVPs (admin)
app.get('/api/rsvps', (req, res) => {
  res.json(rsvps);
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n💒 Site do Casamento Matheus & Iris`);
  console.log(`🌐 Rodando em: http://localhost:${PORT}`);
  console.log(`📱 Acesse pelo celular na mesma rede!\n`);
});
