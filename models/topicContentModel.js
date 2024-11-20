import mongoose from 'mongoose';

const { Schema } = mongoose;

const ImageSchema = new Schema({
  url: { type: String, required: true },
  altText: { type: String, required: true },
});

const CodeSnippetSchema = new Schema({
  code: { type: String, required: true },
});

const DefinitionSchema = new Schema({
  term: { type: String, required: true },
  definition: { type: String, required: true },
});

const TopicContentSchema = new Schema(
  {
    title: { type: String, required: true },
    introduction: { type: String, required: true },
    definitions: [DefinitionSchema],
    images: [ImageSchema],
    codeSnippets: [CodeSnippetSchema],
    additionalNotes: { type: String, required: true },
  },
  { timestamps: true }
);

const TopicContentModel = mongoose.model('TopicContent', TopicContentSchema);

export default TopicContentModel;
