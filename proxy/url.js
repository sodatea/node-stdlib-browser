/* globals unknown */

/**
 * @typedef {import('url').URLFormatOptions} URLFormatOptions
 * @typedef {import('url').UrlObject} UrlObject
 * @typedef {import('url').format} formatImport
 * @typedef {import('url').parse} parseImport
 * @typedef {import('url').resolve} resolveImport
 * @typedef {import('url').Url} UrlImport
 * @typedef {import('url').fileURLToPath} fileURLToPath
 * @typedef {import('url').pathToFileURL} pathToFileURL
 * @typedef {import('url').domainToUnicode} domainToUnicode
 * @typedef {import('url').domainToASCII} domainToASCII
 */

// @ts-ignore
import { format, parse, resolve, resolveObject, Url } from 'native-url';

const formatImport = /** @type {formatImport}*/ (format);
const parseImport = /** @type {parseImport}*/ (parse);
const resolveImport = /** @type {resolveImport}*/ (resolve);
const UrlImport = /** @type {UrlImport}*/ (Url);

const URL = globalThis.URL;
/* eslint-disable-next-line unicorn/prevent-abbreviations */
const URLSearchParams = globalThis.URLSearchParams;

const percentRegEx = /%/g;
const backslashRegEx = /\\/g;
const newlineRegEx = /\n/g;
const carriageReturnRegEx = /\r/g;
const tabRegEx = /\t/g;
const CHAR_FORWARD_SLASH = 47;

/**
 * @param {unknown} instance
 */
function isURLInstance(instance) {
	const resolved = /** @type {URL|null} */ (instance ?? null);
	return Boolean(resolved !== null && resolved?.href && resolved?.origin);
}

/**
 * @param {URL} url
 */
function getPathFromURLPosix(url) {
	if (url.hostname !== '') {
		throw new TypeError(
			`File URL host must be "localhost" or empty on browser`
		);
	}
	const pathname = url.pathname;
	for (let n = 0; n < pathname.length; n++) {
		if (pathname[n] === '%') {
			// @ts-ignore
			const third = pathname.codePointAt(n + 2) | 0x20;
			if (pathname[n + 1] === '2' && third === 102) {
				throw new TypeError(
					'File URL path must not include encoded / characters'
				);
			}
		}
	}
	return decodeURIComponent(pathname);
}

/**
 * @param {string} filepath
 */
function encodePathChars(filepath) {
	if (filepath.includes('%')) {
		filepath = filepath.replace(percentRegEx, '%25');
	}
	if (filepath.includes('\\')) {
		filepath = filepath.replace(backslashRegEx, '%5C');
	}
	if (filepath.includes('\n')) {
		filepath = filepath.replace(newlineRegEx, '%0A');
	}
	if (filepath.includes('\r')) {
		filepath = filepath.replace(carriageReturnRegEx, '%0D');
	}
	if (filepath.includes('\t')) {
		filepath = filepath.replace(tabRegEx, '%09');
	}
	return filepath;
}

const domainToASCII =
	/**
	 * @type {domainToASCII}
	 */
	function (domain) {
		if (typeof domain === 'undefined') {
			throw new TypeError('The "domain" argument must be specified');
		}
		return new URL(`http://${domain}`).hostname;
	};

const domainToUnicode =
	/**
	 * @type {domainToUnicode}
	 */
	function (domain) {
		if (typeof domain === 'undefined') {
			throw new TypeError('The "domain" argument must be specified');
		}
		return new URL(`http://${domain}`).hostname;
	};

const pathToFileURL =
	/**
	 * @type {(url: string) => URL}
	 */
	function (filepath) {
		const outURL = new URL('file://');
		let resolved = filepath;
		const filePathLast = filepath.charCodeAt(filepath.length - 1);
		if (
			filePathLast === CHAR_FORWARD_SLASH &&
			resolved[resolved.length - 1] !== '/'
		) {
			resolved += '/';
		}
		outURL.pathname = encodePathChars(resolved);
		return outURL;
	};

const fileURLToPath =
	/**
	 * @type {fileURLToPath}
	 */
	function (path) {
		if (!isURLInstance(path) && typeof path !== 'string') {
			throw new TypeError(
				`The "path" argument must be of type string or an instance of URL. Received type ${typeof path} (${path})`
			);
		}
		const resolved = new URL(path);
		if (resolved.protocol !== 'file:') {
			throw new TypeError('The URL must be of scheme file');
		}
		return getPathFromURLPosix(resolved);
	};

const formatImportWithOverloads =
	/**
	 * @type {(
	 *   ((urlObject: URL, options?: URLFormatOptions) => string) &
	 *   ((urlObject: UrlObject | string, options?: never) => string)
	 * )}
	 */
	function (urlObject, options) {
		if (!(urlObject instanceof URL)) {
			return formatImport(urlObject);
		}
		const { auth, fragment, search, unicode } = options ?? {
			auth: true,
			fragment: true,
			search: true,
			unicode: false
		};

		const parsed = parseImport(urlObject.toString());

		if (!auth) {
			parsed.auth = null;
		}

		if (!fragment) {
			parsed.hash = null;
		}

		if (!search) {
			parsed.search = null;
			parsed.query = null;
		}

		return formatImport(parsed);
	};

const api = {
	format: formatImportWithOverloads,
	parse: parseImport,
	resolve: resolveImport,
	resolveObject,
	Url: UrlImport,
	URL,
	URLSearchParams,
	domainToASCII,
	domainToUnicode,
	pathToFileURL,
	fileURLToPath
};

export default api;

export {
	formatImportWithOverloads as format,
	parseImport as parse,
	resolveImport as resolve,
	resolveObject,
	UrlImport as Url,
	URL,
	URLSearchParams,
	domainToASCII,
	domainToUnicode,
	pathToFileURL,
	fileURLToPath
};
