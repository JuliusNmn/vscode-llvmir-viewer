import * as vscode from 'vscode';
import * as child_process from "child_process";

export class LLVMIRViewerProvider implements vscode.TextDocumentContentProvider {

	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		const provider = new LLVMIRViewerProvider(context);
		const providerRegistration = vscode.window.registerCustomEditorProvider(LLVMIRViewerProvider.viewType, provider);
		return providerRegistration;
	}

	private static readonly viewType = 'llvmirviewer';


	constructor(
		private readonly context: vscode.ExtensionContext
	) { }
	onDidChange?: vscode.Event<vscode.Uri> | undefined;
	openCustomDocument(uri: vscode.Uri, openContext: vscode.CustomDocumentOpenContext, token: vscode.CancellationToken): vscode.CustomDocument | Thenable<vscode.CustomDocument> {
		return { uri, dispose: (): void => {} };
	}
	resolveCustomEditor(document: vscode.CustomDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): void | Thenable<void> {

		// Setup initial content for the webview
		webviewPanel.webview.options = {
			enableScripts: true,
		};
		this.provideTextDocumentContent(document.uri).then((value: string) => {
			let html = "<html><body><p style=\"font-family: monospace\">";
			value.split("\n").forEach(line => {
				html += line+"<br>\n";
			});
			html += "</p></body></html>";
			webviewPanel.webview.html = html;
		});
		
	}


	provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
		return new Promise((resolve, _reject) => {
			const objFilePath = uri.path;
            const cmd = `llvm-objcopy-14 --dump-section .llvmbc=- '${objFilePath}' | llvm-dis-14`;
            
			const command = child_process.exec(cmd);

			let stdout = "; " + cmd + "\n";
			let stderr = "";

			command.stdout?.on("data", (data: { toString(): string }) => {
				stdout += data.toString() + "\n";
			});

			command.stderr?.on("data", (data: { toString(): string }) => {
				stderr += data.toString();
			});

			command.on("close", (code: number) => {
				if (code === 0) resolve(stdout);
				else {
					//utils.output.appendLine("Command Failed:");
					//utils.output.appendLine(stderr.replace(/^/gm, "\t")); // indent stderr
					throw new Error(stderr);
				}
			});

			command.on("error", (error) => {
				//utils.output.appendLine(`Command Failed: ${error.message}`);
				throw new Error(error.message);
			});
		});
	}
}
