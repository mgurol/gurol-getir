import mongoose from 'mongoose'

export interface IRecord {
  key: String;
  createdAt: Date;
  counts: [Number];
  value: String;
}

interface recordModelInterface extends mongoose.Model<RecordDoc> {
  build(attr: IRecord): RecordDoc
}

interface RecordDoc extends mongoose.Document {
  key: String;
  createdAt: Date;
  counts: [Number];
  value: String;
}

const recordSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true
  },
  counts: {
    type: [Number],
    required: true
  },
  value: {
    type: String,
    required: true
  },
})

recordSchema.statics.build = (attr: IRecord) => {
  return new Record(attr)
}

const Record = mongoose.model<RecordDoc, recordModelInterface>('Record', recordSchema)

Record.build({
  key: 'SOME-KEY',
  createdAt: new Date('2015-03-08T13:40:13.165+00:00'),
  counts: [0],
  value: 'Some Value'
})

export { Record }
