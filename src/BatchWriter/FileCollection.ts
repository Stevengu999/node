import { inject, injectable } from 'inversify'
import { Collection } from 'mongodb'

export interface Entry {
  _id?: string
  ipfsHash: string
  successTime?: number
}

type init = () => Promise<void>

type addEntry = (x: Entry) => Promise<any>

type findNextEntries = () => Promise<ReadonlyArray<Entry>>

type setEntrySuccessTime = (x: Entry) => Promise<any>

type setEntrySuccessTimes = (xs: ReadonlyArray<Entry>) => Promise<any>

@injectable()
export class FileCollection {
  private readonly collection: Collection

  constructor(@inject('collection') collection: Collection) {
    this.collection = collection
  }

  init: init = async () => {
    await this.collection.createIndex({ ipfsHash: 1 }, { unique: true })
  }

  addEntry: addEntry = ({ ipfsHash = '' }) => this.collection.insertOne({ ipfsHash, successTime: null })

  findNextEntries: findNextEntries = () =>
    this.collection.find({ successTime: null }, { fields: { _id: false, ipfsHash: true } }).toArray()

  setEntrySuccessTime: setEntrySuccessTime = ({ ipfsHash = '', successTime = new Date().getTime() }) =>
    this.collection.updateOne({ ipfsHash }, { $set: { successTime } })

  setEntrySuccessTimes: setEntrySuccessTimes = (entries = []) =>
    Promise.all(
      entries.map(({ ipfsHash, successTime = new Date().getTime() }) =>
        this.setEntrySuccessTime({ ipfsHash, successTime })
      )
    )
}
