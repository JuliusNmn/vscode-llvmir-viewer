import * as vscode from 'vscode';
import * as child_process from "child_process";

export class LLVMIRViewerProvider implements vscode.TextDocumentContentProvider {

	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		const provider = new LLVMIRViewerProvider(context);
		const providerRegistration = vscode.workspace.registerTextDocumentContentProvider(LLVMIRViewerProvider.scheme, provider);
		return providerRegistration;
	}

	static readonly scheme = 'llvmir';


	constructor(
		private readonly context: vscode.ExtensionContext
	) { }
	

	provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
		const workbenchConfig = vscode.workspace.getConfiguration();
		const llvmversion = workbenchConfig.get('config.llvm-ir-viewer.llvm-version');
		return new Promise((resolve, _reject) => {
			const objFilePath = uri.path;

            const cmd = `llvm-objcopy-${llvmversion} --dump-section .llvmbc=- '${objFilePath}' | llvm-dis-${llvmversion}`;
            
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
					throw new Error(stderr);
				}
			});

			command.on("error", (error) => {
				throw new Error(error.message);
			});
		});
	}


}
