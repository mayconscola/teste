app.post('/create-pix', async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    // ✅ Verificando caminho e leitura do .pem com segurança
    const certPath = process.env.CERT_PATH;
    let certContent = '';
    try {
      certContent = fs.readFileSync(certPath).toString();
      console.log("✅ Cert path:", certPath);
      console.log("📄 Cert conteúdo (início):", certContent.slice(0, 100), '...');
    } catch (readErr) {
      console.error("❌ Erro ao ler o certificado .pem:", readErr.message);
      return res.status(500).json({ error: 'Erro ao ler o certificado. Verifique o caminho ou o arquivo.' });
    }

    const response = await axios.post(
      'https://api.efipay.com.br/v1/charge/pix',
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
          cert: certContent,
          key: certContent // O .pem contém a chave privada + certificado
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
