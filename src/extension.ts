import * as vscode from 'vscode';
import { LLVMIRViewerProvider } from './LLVMIRViewerProvider';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(LLVMIRViewerProvider.register(context));
	
}
