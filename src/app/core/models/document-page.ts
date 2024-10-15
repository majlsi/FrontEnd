import { DocumentField } from "./document-field";

export  class DocumentPage {
	DocumentPageID: number;
	DocumentID: number;
	PageNumber: number;
	DocumentPageUrl: string;
	DocumentFields: Array<DocumentField>;
	ReturnURL: string;
	CallbackURL: string;

}
