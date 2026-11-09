import {existsSync, readdirSync, readFileSync, statSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import ts from "typescript";

const modulesRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function collectFiles(directoryPath: string): string[] {
  if (!existsSync(directoryPath) || !statSync(directoryPath).isDirectory()) {
    return [];
  }
  return readdirSync(directoryPath).flatMap((entryName) => {
    const entryPath = path.join(directoryPath, entryName);
    return statSync(entryPath).isDirectory()
      ? collectFiles(entryPath)
      : entryPath.endsWith(".ts") || entryPath.endsWith(".tsx") ? [entryPath] : [];
  });
}

function propertyName(node: ts.PropertyName | undefined): string | undefined {
  if (node === undefined) {
    return undefined;
  }
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) {
    return node.text;
  }
  return undefined;
}

function isSnakeCasePropertyName(name: string): boolean {
  return /^[a-z][a-z0-9]*(_[a-z0-9]+)+$/.test(name);
}

export function assertModuleJsonNamingContract(moduleName: string): void {
  const modulePath = path.join(modulesRoot, moduleName);
  const typeDirectories = moduleName === "identity"
    ? [path.join(modulePath, "auth", "types"), path.join(modulePath, "user", "types")]
    : [path.join(modulePath, "types")];
  const clientDirectories = moduleName === "identity"
    ? [path.join(modulePath, "auth", "clients"), path.join(modulePath, "user", "clients")]
    : [path.join(modulePath, "clients")];
  const typeFiles = typeDirectories.flatMap(collectFiles);
  const clientFiles = clientDirectories.flatMap(collectFiles).filter((filePath) => !filePath.endsWith(".test.ts"));
  const moduleSourceFiles = collectFiles(modulePath).filter((filePath) => !filePath.endsWith(".test.ts"));

  if (clientFiles.length === 0) {
    throw new Error(`No HTTP client files found for module '${moduleName}'`);
  }

  for (const clientPath of clientFiles) {
    const clientSource = readFileSync(clientPath, "utf8");
    assertQueryKeysAreCamelCase(clientPath, clientSource);
    const sourceFile = ts.createSourceFile(clientPath, clientSource, ts.ScriptTarget.Latest, true);
    let clientHttpCalls = 0;
    visit(sourceFile, (node) => {
      if (ts.isCallExpression(node)) {
        const expressionText = node.expression.getText(sourceFile);
        if (/\.(get|post|put|patch|delete|request)\b/.test(expressionText) || expressionText === "fetch") {
          clientHttpCalls++;
        }
        if (ts.isPropertyAccessExpression(node.expression)
          && (node.expression.name.text === "append" || node.expression.name.text === "set")) {
          const keyArgument = node.arguments[0];
          if (keyArgument !== undefined && ts.isStringLiteral(keyArgument)) {
            assertPropertyIsCamelCase(clientPath, sourceFile, keyArgument);
          }
        }
      }
      if (ts.isPropertyAssignment(node) || ts.isPropertySignature(node) || ts.isMethodSignature(node)) {
        assertPropertyIsCamelCase(clientPath, sourceFile, node.name);
      }
    });
    if (clientHttpCalls === 0) {
      throw new Error(`${clientPath} should contain an explicit HTTP call`);
    }
  }

  for (const typePath of typeFiles) {
    const sourceFile = ts.createSourceFile(typePath, readFileSync(typePath, "utf8"), ts.ScriptTarget.Latest, true);
    visit(sourceFile, (node) => {
      if (ts.isPropertySignature(node) || ts.isMethodSignature(node)) {
        assertTypedPropertyIsCamelCase(typePath, sourceFile, node.name);
      }
    });
  }

  for (const sourcePath of moduleSourceFiles) {
    const moduleSource = readFileSync(sourcePath, "utf8");
    assertQueryKeysAreCamelCase(sourcePath, moduleSource);
    const sourceFile = ts.createSourceFile(sourcePath, moduleSource, ts.ScriptTarget.Latest, true);
    visit(sourceFile, (node) => {
      if (ts.isPropertyAssignment(node)) {
        assertPropertyIsCamelCase(sourcePath, sourceFile, node.name);
      }
      if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)
        && (node.expression.name.text === "append" || node.expression.name.text === "set")) {
        const keyArgument = node.arguments[0];
        if (keyArgument !== undefined && ts.isStringLiteral(keyArgument)) {
          assertPropertyIsCamelCase(sourcePath, sourceFile, keyArgument);
        }
      }
    });
  }
}

function assertQueryKeysAreCamelCase(filePath: string, source: string): void {
  const snakeCaseQueryKey = /[?&]([A-Za-z][A-Za-z0-9]*(?:_[A-Za-z0-9]+)+)=/g;
  for (const match of source.matchAll(snakeCaseQueryKey)) {
    throw new Error(`${filePath} has snake_case HTTP query key '${match[1]}'`);
  }
}

function visit(sourceFile: ts.SourceFile, callback: (node: ts.Node) => void): void {
  const inspect = (node: ts.Node) => {
    callback(node);
    ts.forEachChild(node, inspect);
  };
  inspect(sourceFile);
}

function assertPropertyIsCamelCase(filePath: string, sourceFile: ts.SourceFile, property: ts.PropertyName | undefined): void {
  const name = propertyName(property);
  if (name !== undefined && isSnakeCasePropertyName(name)) {
    const sourcePosition = sourceFile.getLineAndCharacterOfPosition(property!.getStart(sourceFile));
    throw new Error(`${filePath}:${sourcePosition.line + 1} has snake_case contract property '${name}'`);
  }
}

function assertTypedPropertyIsCamelCase(filePath: string, sourceFile: ts.SourceFile, property: ts.PropertyName | undefined): void {
  const name = propertyName(property);
  if (name !== undefined && /^[A-Za-z][A-Za-z0-9]*(_[A-Za-z0-9]+)+$/.test(name)) {
    const sourcePosition = sourceFile.getLineAndCharacterOfPosition(property!.getStart(sourceFile));
    throw new Error(`${filePath}:${sourcePosition.line + 1} has non-camelCase contract property '${name}'`);
  }
}
