// Carregar variáveis de ambiente antes de tudo
import { config } from 'dotenv';
config();

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import * as os from 'os';
import handler from '../api/signals';

/**
 * Servidor de desenvolvimento local
 * Simula o ambiente Vercel para testar localmente
 */
const PORT = process.env.PORT || 3000;

interface ExtendedRequest extends IncomingMessage {
  method?: string;
  url?: string;
  body?: unknown;
}

interface ExtendedResponse {
  statusCode: number;
  status: (code: number) => ExtendedResponse;
  json: (data: unknown) => void;
  setHeader: (name: string, value: string | number | string[]) => void;
  end: (data?: string) => void;
}

function createExtendedResponse(res: ServerResponse): ExtendedResponse {
  const extRes: ExtendedResponse = {
    statusCode: res.statusCode,
    status: (code: number): ExtendedResponse => {
      res.statusCode = code;
      extRes.statusCode = code;
      return extRes;
    },
    json: (data: unknown): void => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    },
    setHeader: (name: string, value: string | number | string[]): void => {
      res.setHeader(name, value);
    },
    end: (data?: string): void => {
      res.end(data);
    },
  };
  return extRes;
}

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  // Log de todas as requisições para debug
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  const parsedUrl = parse(req.url || '', true);
  const pathname = parsedUrl.pathname;

  // Criar objetos compatíveis com Vercel Request/Response
  const vercelReq = req as ExtendedRequest;
  const vercelRes = createExtendedResponse(res);

  // Parse body para requisições POST
  if (req.method === 'POST' || req.method === 'PUT') {
    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        vercelReq.body = JSON.parse(body);
        await handleRequest(vercelReq, vercelRes, pathname);
      } catch (error) {
        vercelRes.status(400).json({
          success: false,
          error: { message: 'JSON inválido', code: 'INVALID_JSON' },
        });
      }
    });
  } else {
    await handleRequest(vercelReq, vercelRes, pathname);
  }
});

async function handleRequest(
  req: ExtendedRequest,
  res: ExtendedResponse,
  pathname: string | null
): Promise<void> {
  // Roteamento
  if (pathname === '/api/signals') {
    await handler(req as never, res as never);
  } else if (pathname === '/health') {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
  } else {
    res.status(404).json({
      success: false,
      error: { message: 'Rota não encontrada', code: 'NOT_FOUND' },
    });
  }
}

server.listen(Number(PORT), '0.0.0.0', () => {
  const networkInterfaces = os.networkInterfaces();
  let localIP = 'localhost';
  
  // Tentar encontrar IP local (não localhost)
  for (const name of Object.keys(networkInterfaces)) {
    const interfaces = networkInterfaces[name];
    if (!interfaces) continue;
    
    for (const iface of interfaces) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIP = iface.address;
        break;
      }
    }
    if (localIP !== 'localhost') break;
  }
  
  console.log(`🚀 Servidor rodando!`);
  console.log(`📡 Endpoint: http://localhost:${PORT}/api/signals`);
  if (localIP !== 'localhost') {
    console.log(`📡 Endpoint (IP - USE ESTE NO MT5): http://${localIP}:${PORT}/api/signals`);
    console.log(`\n🔧 CONFIGURACAO MT5:`);
    console.log(`   1. Tools -> Options -> Expert Advisors`);
    console.log(`   2. Marque "Allow WebRequest for listed URL"`);
    console.log(`   3. Adicione: http://${localIP}:${PORT}/*`);
    console.log(`   4. No indicador, use: http://${localIP}:${PORT}/api/signals`);
    console.log(`   5. REINICIE O MT5`);
  }
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`\n⚠️  Certifique-se de que o arquivo .env está configurado!`);
});
