const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Configuração do servidor
const app = express();
const PORT = process.env.PORT || 3000;

// Detectar ambiente Vercel
const isVercel = process.env.VERCEL === '1';
console.log('Ambiente:', isVercel ? 'Vercel (produção)' : 'Local');

// Armazenamento em memória para o Vercel
const inMemoryDb = { images: [] };
const inMemoryUploads = {}; // Para armazenar os arquivos de imagem em memória

// Middleware para permitir CORS - configuração mais detalhada
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Middleware para OPTIONS requests (preflight CORS)
app.options('*', cors(corsOptions));

// Log de todas as requisições para debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(express.json());

// Servir arquivos estáticos da pasta uploads - diferente no Vercel
if (!isVercel) {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  app.use(express.static(path.join(__dirname, 'public')));
} else {
  // No Vercel, geramos URL para as imagens em memória
  app.get('/uploads/:id', (req, res) => {
    const imageId = req.params.id;
    const image = inMemoryUploads[imageId];
    
    if (!image) {
      return res.status(404).send('Imagem não encontrada');
    }
    
    res.set('Content-Type', image.mimetype);
    res.send(image.buffer);
  });
  
  // Servir arquivos estáticos para o Vercel
  app.use(express.static(path.join(__dirname, 'public')));
}

// Configuração do armazenamento para multer - diferente em Vercel
let storage;
let upload;

if (isVercel) {
  // Em produção no Vercel, usar armazenamento em memória
  storage = multer.memoryStorage();
  upload = multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024 // limite de 5MB
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Apenas arquivos de imagem são aceitos'), false);
      }
    }
  });
} else {
  // Em ambiente local, usar armazenamento em disco
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Garantir que o diretório de uploads existe
      const uploadDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadDir)) {
        try {
          fs.mkdirSync(uploadDir, { recursive: true });
          console.log(`Diretório de uploads criado: ${uploadDir}`);
        } catch (err) {
          console.error(`Erro ao criar diretório de uploads: ${err.message}`);
        }
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Gera um nome de arquivo único baseado em UUID
      const uniqueId = uuidv4();
      const fileExtension = path.extname(file.originalname);
      cb(null, `${uniqueId}${fileExtension}`);
    }
  });

  upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Apenas arquivos de imagem são aceitos'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024 // limite de 5MB
    }
  });
}

// Rota para salvar banco de dados de imagens - diferente em Vercel
const DB_PATH = path.join(__dirname, 'uploads', 'images-db.json');

// Função auxiliar para ler o banco de dados
function readImagesDb() {
  if (isVercel) {
    return inMemoryDb;
  }
  
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(data);
    }
    return { images: [] };
  } catch (error) {
    console.error('Erro ao ler o banco de dados:', error);
    return { images: [] };
  }
}

// Função auxiliar para salvar no banco de dados
function saveImagesDb(data) {
  if (isVercel) {
    inMemoryDb.images = data.images;
    return;
  }
  
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Erro ao salvar no banco de dados:', error);
  }
}

// Rota para upload de imagem
app.post('/api/upload', (req, res, next) => {
  console.log('Recebida solicitação de upload:', req.headers);
  next();
}, upload.single('image'), (req, res) => {
  try {
    console.log('Processando upload, arquivo:', req.file);
    
    if (!req.file) {
      console.error('Nenhum arquivo recebido no upload');
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    // ID único para a imagem
    const imageId = uuidv4();
    let imageData;

    if (isVercel) {
      // Em produção no Vercel, armazenar em memória
      inMemoryUploads[imageId] = {
        buffer: req.file.buffer,
        mimetype: req.file.mimetype
      };

      // Preparar dados da imagem para o banco de dados
      imageData = {
        id: imageId,
        filename: `${imageId}${path.extname(req.file.originalname)}`,
        originalName: req.file.originalname,
        path: `/uploads/${imageId}`,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploadDate: new Date().toISOString()
      };
    } else {
      // Em ambiente local, armazenar no disco
      imageData = {
        id: path.parse(req.file.filename).name,
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: `/uploads/${req.file.filename}`,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploadDate: new Date().toISOString()
      };
    }

    console.log('Dados da imagem processados:', imageData);

    // Ler banco de dados atual
    const db = readImagesDb();
    
    // Adicionar nova imagem
    db.images.push(imageData);
    
    // Salvar banco de dados atualizado
    saveImagesDb(db);

    // Retornar dados da imagem para o cliente
    console.log('Upload concluído com sucesso');
    res.status(201).json({
      success: true,
      image: imageData
    });
  } catch (error) {
    console.error('Erro ao processar upload:', error);
    res.status(500).json({ error: `Erro ao processar upload: ${error.message}` });
  }
});

// Rota para listar todas as imagens
app.get('/api/images', (req, res) => {
  try {
    const db = readImagesDb();
    res.json({ images: db.images });
  } catch (error) {
    console.error('Erro ao buscar imagens:', error);
    res.status(500).json({ error: 'Erro ao buscar imagens' });
  }
});

// Rota para excluir uma imagem
app.delete('/api/images/:id', (req, res) => {
  try {
    const imageId = req.params.id;
    const db = readImagesDb();
    
    // Encontrar a imagem no banco de dados
    const imageIndex = db.images.findIndex(img => img.id === imageId);
    
    if (imageIndex === -1) {
      return res.status(404).json({ error: 'Imagem não encontrada' });
    }
    
    // Obter dados da imagem
    const image = db.images[imageIndex];
    
    if (isVercel) {
      // Remover da memória
      if (inMemoryUploads[imageId]) {
        delete inMemoryUploads[imageId];
      }
    } else {
      // Excluir arquivo físico
      const filePath = path.join(__dirname, 'uploads', image.filename);
      
      // Verificar se o arquivo existe
      if (fs.existsSync(filePath)) {
        // Excluir o arquivo
        fs.unlinkSync(filePath);
      }
    }
    
    // Remover do banco de dados
    db.images.splice(imageIndex, 1);
    
    // Salvar banco de dados atualizado
    saveImagesDb(db);
    
    res.json({ success: true, message: 'Imagem excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir imagem:', error);
    res.status(500).json({ error: 'Erro ao excluir imagem' });
  }
});

// Para compatibilidade com Vercel
module.exports = app;

// Iniciar o servidor apenas se não estiver no Vercel
if (!isVercel) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    
    // Criar pasta uploads se não existir
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Criar arquivo de banco de dados se não existir
    if (!fs.existsSync(DB_PATH)) {
      saveImagesDb({ images: [] });
    }
  });
} 