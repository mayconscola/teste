app.post('/create-pix', async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    // 🔍 Verificar caminho e conteúdo do certificado
    console.log("Cert path:", process.env.CERT_PATH);
    console.log("Cert conteúdo:", fs.readFileSync(process.env.CERT_PATH).toString());

    const response = await axios.post(
      'https://api.efipay.com.br/v1/charge/pix', // ✅ endpoint correto
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
            expire_at: 3600
          }
        }
      },
      {
        httpsAgent: new https.Agent({
          cert: fs.readFileSync(process.env.CERT_PATH),
          key: fs.readFileSync(process.env.CERT_PATH) // pem com chave privada também
        }),
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Id': process.env.CLIENT_ID,
          'X-Client-Secret': process.env.CLIENT_SECRET
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("❌ Erro ao gerar Pix:", err?.response?.data || err.message || err);
    res.status(500).json({
      error: err?.response?.data || err.message || "Erro interno ao gerar Pix"
    });
  }
});
