import * as fs from 'fs';
import * as path from 'path';

type LogLevel = 'INFO' | 'ERROR' | 'WARN' | 'DEBUG';

class Logger {
  private logDir: string;

  constructor() {
    this.logDir = path.join(process.cwd(), "logs");
    this.ensureLogDir();
  }

  private ensureLogDir(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatTimestamp(): string {
    return new Intl.DateTimeFormat("it-IT", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
      .format(new Date())
      .replace(",", "");
  }

  private log(level: LogLevel, message: string, error?: Error): void {
    const timestamp = this.formatTimestamp();
    const logMessage = `[${timestamp}] [${level}] ${message}`;

    const colors: Record<LogLevel | "RESET", string> = {
      INFO: "\x1b[36m",
      ERROR: "\x1b[31m",
      WARN: "\x1b[33m",
      DEBUG: "\x1b[35m",
      RESET: "\x1b[0m",
    };

    console.log(`${colors[level]}${logMessage}${colors.RESET}`);

    if (error) {
      console.error(`${colors.ERROR}${error.stack}${colors.RESET}`);
    }

    const dateStr = new Date().toISOString().substring(0, 10);
    const logFile = path.join(this.logDir, `${dateStr}.log`);
    const fileMessage = error
      ? `${logMessage}\n${error.stack}\n`
      : `${logMessage}\n`;

    fs.appendFileSync(logFile, fileMessage, "utf8");
  }

  public info(message: string): void {
    this.log("INFO", message);
  }

  public error(message: string, error?: Error): void {
    this.log("ERROR", message, error);
  }

  public warn(message: string): void {
    this.log("WARN", message);
  }

  public debug(message: string): void {
    this.log("DEBUG", message);
  }
}

export default new Logger();
