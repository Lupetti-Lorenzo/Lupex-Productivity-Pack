// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

export function activate({ subscriptions }: vscode.ExtensionContext) {
	const config = vscode.workspace.getConfiguration("lupex");
	//TIMER
	if (config.timer === true) {
		let myStatusBarItem: vscode.StatusBarItem;
		let intervalID: any;
		let currentTime: number = 0;
		const statusBarIcon: string = "$(extensions-sync-enabled)";
		const statusBarTxt: string = `${statusBarIcon} Timer`;
		//interface just to make the timerStates iterable
		interface IterableObj<TValue> {
			[id: string]: TValue;
		}
		const timerStates = Object.freeze({
			start: "START",
			stop: "STOP",
			restart: "RESTART",
		}) as IterableObj<string>;

		let currentState = timerStates.restart;

		// register a command that is invoked when the status bar item is selected
		const myCommandId = "lupex.timer";
		subscriptions.push(
			vscode.commands.registerCommand(myCommandId, () => {
				//Initialize quickpick
				const quickPick = vscode.window.createQuickPick();

				//fill the quickpick with only items that make sense
				let items: vscode.QuickPickItem[] = [];
				for (let state in timerStates) {
					let label = timerStates[state];
					if (label !== currentState) {
						items.push({ label });
					}
				}
				quickPick.items = items;

				//what happens when I pick an item from the quickPick
				quickPick.onDidChangeSelection(([item]) => {
					if (item) {
						switch (item.label) {
							case "STOP":
								//stop the interval
								currentState = timerStates.stop;
								clearInterval(intervalID);
								intervalID = undefined;
								break;

							case "START":
								currentState = timerStates.start;
								startLoop();
								break;

							case "RESTART":
								currentState = timerStates.restart;
								//stop the interval
								clearInterval(intervalID);
								intervalID = undefined;

								myStatusBarItem.text = statusBarTxt;
								currentTime = 0;
								break;

							default:
								break;
						}
						quickPick.hide();
					}
				});
				quickPick.show();
			}),
		);

		// create a new status bar item
		myStatusBarItem = vscode.window.createStatusBarItem(
			vscode.StatusBarAlignment.Right,
			300,
		);

		myStatusBarItem.command = myCommandId;
		myStatusBarItem.text = statusBarTxt;
		myStatusBarItem.show();
		subscriptions.push(myStatusBarItem);

		function startLoop() {
			//set interval that handle the timer
			intervalID = setInterval(() => {
				currentTime++;
				myStatusBarItem.text =
					statusBarIcon +
					` ${new Date(currentTime * 1000)
						.toISOString()
						.substr(11, 8)}`;
			}, 1000);
		}
	}

	//
	//COUNT DOWN
	//

	if (config.countDown.enabled === true) {
		let myStatusBarItem: vscode.StatusBarItem;
		let intervalID: any = undefined;
		let currentTime: number = 0;
		const statusBarIcon: string = "$(timeline-open)";
		const statusBarTxt: string = `${statusBarIcon} Next Stretch`;
		// register a command that is invoked when the status bar item is selected
		const myCommandId = "lupex.countDown";
		subscriptions.push(
			vscode.commands.registerCommand(myCommandId, () => {
				if (intervalID === undefined) {
					//Initialize quickpick
					const quickPick = vscode.window.createQuickPick();
					quickPick.items = [
						{ label: "1 min" },
						{ label: "5 min" },
						{ label: "10 min" },
						{ label: "20 min" },
						{ label: "25 min" },
						{ label: "30 min" },
						{ label: "35 min" },
						{ label: "40 min" },
						{ label: "60 min" },
					];

					quickPick.onDidChangeSelection(([item]) => {
						if (item) {
							//set the time picked and start the count down
							let time = Number(item.label.slice(0, 2));
							currentTime = time * 60;
							startLoop(time);
						}
						quickPick.hide();
					});
					quickPick.show();
				} else {
					//if the timer is already set, interrupt it and set everything to default.
					resetCountDown();
				}
			}),
		);

		// create a new status bar item
		myStatusBarItem = vscode.window.createStatusBarItem(
			vscode.StatusBarAlignment.Right,
			299,
		);

		myStatusBarItem.command = myCommandId;
		myStatusBarItem.text = statusBarTxt;
		myStatusBarItem.show();
		subscriptions.push(myStatusBarItem);

		function resetCountDown() {
			myStatusBarItem.text = statusBarTxt;
			clearInterval(intervalID);
			myStatusBarItem.color = undefined;
			intervalID = undefined;
		}

		function startLoop(time: number) {
			//set interval that handle the count down
			intervalID = setInterval(() => {
				if (currentTime <= 0) {
					vscode.window.showInformationMessage(
						`${time} mins passed, get up and do some stretching!!`,
					);
					resetCountDown();
				} else {
					currentTime--;

					//last 30s display red text
					const setting: string =
						config.countDown.redTextLastTotSeconds;
					if (setting !== "inactive") {
						const color: string = "firebrick";
						let num: number;
						if (setting.slice(0, 1) !== "3") {
							num = Number(setting.slice(0, 1)) * 60;
						} else {
							num = 30;
						}
						if (
							currentTime <= num &&
							myStatusBarItem.color !== color
						) {
							myStatusBarItem.color = color;
						}
					}
					//update the text
					myStatusBarItem.text =
						statusBarIcon +
						` ${new Date(currentTime * 1000)
							.toISOString()
							.substr(11, 8)}`;
				}
			}, 1000);
		}
	}
}

// this method is called when your extension is deactivated
export function deactivate() {}
