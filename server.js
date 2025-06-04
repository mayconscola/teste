import express from 'express';
import fs from 'fs';
import https from 'https';
import axios from 'axios';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(bodyParser.json());

app.post('/create-pix', async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    const response = await axios.post(
      'https://api.efipay.com.br/v1/charge/pix', // ENDPOINT CORRETO
      {
        items: [
          {
            name: "Plano Profissional",
            value: amount,
            amount: 1
          }
        ],
        payment: {
          pix: {
            expire_at: 3600 // 1 hora
          }
        }
      },
      {
        httpsAgent: new https.Agent({
          cert: fs.readFileSync(process.env.CERT_PATH), // Exemplo: ./certs/producao-682910-SAAS.pem
          key: fs.readFileSync(process.env.CERT_PATH)   // Mesmo arquivo .pem (inclui cert + key)
        }),
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Id': process.env.CLIENT_ID,
          'X-Client-Secret': process.env.CLIENT_SECRET
        }
      }
    );

    res.json(response.data); // Sucesso
  } catch (err) {
    console.error("❌ Erro ao gerar Pix:", err?.response?.data || err.message || err);
    res.status(500).json({
      error: err?.response?.data || err.message || "Erro interno ao gerar Pix"
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ API Pix rodando na porta ${port}`);
});
