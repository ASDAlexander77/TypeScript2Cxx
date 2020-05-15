import {AppWindow} from 'appwindow';

export class Application {
    static appWindow: AppWindow;

    static run() {
        this.appWindow = new AppWindow();
    }
}

Application.run();
