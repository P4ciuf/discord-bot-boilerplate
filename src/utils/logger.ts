import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

// Custom color scheme for console logs
const customColors = {
	info: "blue",
	warn: "yellow",
	error: "red",
};

winston.addColors(customColors);

// Console output format with colors and timestamps
const consoleFormat = winston.format.combine(
	winston.format.colorize({ all: true }),
	winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
	winston.format.printf(({ timestamp, level, message, ...meta }) => {
		const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : "";
		return `[${timestamp}] ${level}: ${message} ${metaString}`;
	}),
);

// File output format without colors
const fileFormat = winston.format.combine(
	winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
	winston.format.printf(({ timestamp, level, message, ...meta }) => {
		const metaString = Object.keys(meta).length ? JSON.stringify(meta) : "";
		return `[${timestamp}] ${level.toUpperCase()}: ${message} ${metaString}`;
	}),
);

// Daily rotating file transport for error logs
const errorRotateTransport = new DailyRotateFile({
	filename: path.join("logs", "error", "error-%DATE%.log"),
	datePattern: "DD-MM-YYYY",
	level: "error",
	format: fileFormat,
	maxSize: "20m",
	maxFiles: "14d",
	zippedArchive: true,
});

errorRotateTransport.on("rotate", (oldFilename, newFilename) => {
	console.log(`Log ruotato: ${oldFilename} -> ${newFilename}`);
});

// Main logger instance with console and file transports
const logger = winston.createLogger({
	level: "info",
	transports: [
		new winston.transports.Console({
			format: consoleFormat,
		}),

		errorRotateTransport,
	],
});

export default logger;
