//  this file is a template on how to create a model. Since there are many model files, this file holds the syntax, which is copied in the application's model files.
import { model, models, Schema, Types } from "mongoose";

export interface IModel {}

const ModelSchema = new Schema<IModel>({}, { timestamps: true });

const Model = models?.Model || model<IModel>("Model", ModelSchema);

export default Model;
