// tslint:disable-next-line:no-shadowed-variable
import { ConfigModel } from '../core/interfaces/config';

// tslint:disable-next-line:no-shadowed-variable
export class SignaturFontsConfig implements ConfigModel {
	public config: Array<string> = [];

	constructor() {
		this.config = ['CalendaryHands', 'MrsSaintDelafiel', 'Hijrnotes', 'Unthrift', 'Reey', 'Windsong', 'Yaquote'];

	}
}

