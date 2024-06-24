import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { DocumentNotarized } from "../generated/schema"
import { DocumentNotarized as DocumentNotarizedEvent } from "../generated/Notary/Notary"
import { handleDocumentNotarized } from "../src/notary"
import { createDocumentNotarizedEvent } from "./notary-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let owner = Address.fromString("0x0000000000000000000000000000000000000001")
    let documentHash = "Example string value"
    let timestamp = BigInt.fromI32(234)
    let imageURI = "Example string value"
    let description = "Example string value"
    let newDocumentNotarizedEvent = createDocumentNotarizedEvent(
      owner,
      documentHash,
      timestamp,
      imageURI,
      description
    )
    handleDocumentNotarized(newDocumentNotarizedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("DocumentNotarized created and stored", () => {
    assert.entityCount("DocumentNotarized", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "DocumentNotarized",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "owner",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "DocumentNotarized",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "documentHash",
      "Example string value"
    )
    assert.fieldEquals(
      "DocumentNotarized",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "timestamp",
      "234"
    )
    assert.fieldEquals(
      "DocumentNotarized",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "imageURI",
      "Example string value"
    )
    assert.fieldEquals(
      "DocumentNotarized",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "description",
      "Example string value"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
