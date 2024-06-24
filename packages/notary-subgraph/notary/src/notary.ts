import {
  DocumentNotarized as DocumentNotarizedEvent,
  DocumentRetrieved as DocumentRetrievedEvent,
  DocumentRevoked as DocumentRevokedEvent
} from "../generated/Notary/Notary"
import {
  DocumentNotarized,
  DocumentRetrieved,
  DocumentRevoked
} from "../generated/schema"

export function handleDocumentNotarized(event: DocumentNotarizedEvent): void {
  let entity = new DocumentNotarized(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.documentHash = event.params.documentHash
  entity.timestamp = event.params.timestamp
  entity.imageURI = event.params.imageURI
  entity.description = event.params.description

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDocumentRetrieved(event: DocumentRetrievedEvent): void {
  let entity = new DocumentRetrieved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.requester = event.params.requester
  entity.documentHash = event.params.documentHash
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDocumentRevoked(event: DocumentRevokedEvent): void {
  let entity = new DocumentRevoked(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.documentHash = event.params.documentHash
  entity.timestamp = event.params.timestamp
  entity.description = event.params.description
  entity.imageURI = event.params.imageURI

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
