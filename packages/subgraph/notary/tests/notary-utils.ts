import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  DocumentNotarized,
  DocumentRetrieved,
  DocumentRevoked
} from "../generated/Notary/Notary"

export function createDocumentNotarizedEvent(
  owner: Address,
  documentHash: string,
  timestamp: BigInt,
  imageURI: string,
  description: string
): DocumentNotarized {
  let documentNotarizedEvent = changetype<DocumentNotarized>(newMockEvent())

  documentNotarizedEvent.parameters = new Array()

  documentNotarizedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  documentNotarizedEvent.parameters.push(
    new ethereum.EventParam(
      "documentHash",
      ethereum.Value.fromString(documentHash)
    )
  )
  documentNotarizedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )
  documentNotarizedEvent.parameters.push(
    new ethereum.EventParam("imageURI", ethereum.Value.fromString(imageURI))
  )
  documentNotarizedEvent.parameters.push(
    new ethereum.EventParam(
      "description",
      ethereum.Value.fromString(description)
    )
  )

  return documentNotarizedEvent
}

export function createDocumentRetrievedEvent(
  requester: Address,
  documentHash: string,
  timestamp: BigInt
): DocumentRetrieved {
  let documentRetrievedEvent = changetype<DocumentRetrieved>(newMockEvent())

  documentRetrievedEvent.parameters = new Array()

  documentRetrievedEvent.parameters.push(
    new ethereum.EventParam("requester", ethereum.Value.fromAddress(requester))
  )
  documentRetrievedEvent.parameters.push(
    new ethereum.EventParam(
      "documentHash",
      ethereum.Value.fromString(documentHash)
    )
  )
  documentRetrievedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return documentRetrievedEvent
}

export function createDocumentRevokedEvent(
  owner: Address,
  documentHash: string,
  timestamp: BigInt
): DocumentRevoked {
  let documentRevokedEvent = changetype<DocumentRevoked>(newMockEvent())

  documentRevokedEvent.parameters = new Array()

  documentRevokedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  documentRevokedEvent.parameters.push(
    new ethereum.EventParam(
      "documentHash",
      ethereum.Value.fromString(documentHash)
    )
  )
  documentRevokedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return documentRevokedEvent
}
