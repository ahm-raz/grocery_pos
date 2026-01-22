import os from 'os';
import mongoose from 'mongoose';

const healthCheck = async (req, res) => {
  try {
    // Check database connection status
    const dbStatus = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    const isHealthy = dbStatus === 1; // 1 = connected
    
    const health = {
      status: isHealthy ? 'OK' : 'UNHEALTHY',
      timestamp: new Date().toISOString(),
      service: 'Grocery POS API',
      version: '1.0.0',
      database: {
        status: dbStates[dbStatus] || 'unknown',
        connected: isHealthy
      }
    };

    res.status(isHealthy ? 200 : 503).json(health);
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message
    });
  }
};

/**
 * Basic system metrics endpoint
 * Useful for monitoring and health checks
 */
const getMetrics = async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        uptime: process.uptime(),
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem(),
          usagePercent: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)
        },
        cpu: {
          count: os.cpus().length,
          loadAverage: os.loadavg()
        }
      },
      process: {
        pid: process.pid,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        env: process.env.NODE_ENV || 'development'
      }
    };

    res.status(200).json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve metrics' });
  }
};

export { healthCheck, getMetrics };

