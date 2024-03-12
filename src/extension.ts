import * as vscode from 'vscode';
import { LLVMIRViewerProvider } from './LLVMIRViewerProvider';

export function activate(context: vscode.ExtensionContext) {

	

	context.subscriptions.push(LLVMIRViewerProvider.register(context),
	vscode.commands.registerCommand("llvm-ir-viewer.show-embedded-bitcode", async (fileUri: vscode.Uri) => {
		const bytecodeUri = vscode.Uri.file(fileUri.path).with({ scheme: LLVMIRViewerProvider.scheme });

		await vscode.window.showTextDocument(bytecodeUri);

	}),
	);
	
}
