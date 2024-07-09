"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { useAccount } from "wagmi";

interface NotaryDocument {
  id: string;
  owner: string;
  description: string;
  documentHash: string;
  timestamp: string;
  transactionHash: string;
  imageURI: string;
  blockTimestamp: string;
}

const ListAllNotary = () => {
  const [documents, setDocuments] = useState<NotaryDocument[]>([]);
  const [myRevokedDocuments, setMyRevokedDocuments] = useState<NotaryDocument[]>([]);
  const [descriptionSearchQuery, setDescriptionSearchQuery] = useState("");
  const [ownerSearchQuery, setOwnerSearchQuery] = useState("");
  const [descriptionSearchResults, setDescriptionSearchResults] = useState<NotaryDocument[]>([]);
  const [ownerSearchResults, setOwnerSearchResults] = useState<NotaryDocument[]>([]);
  const { address } = useAccount();

  const generateRandomImage = (title: string) => {
    const width = 400;
    const height = 300;
    const seed = title.replace(/\s+/g, "-").toLowerCase();
    return `https://picsum.photos/seed/${seed}/${width}/${height}`;
  };

  const client = new ApolloClient({
    uri: "https://api.studio.thegraph.com/query/76464/decentralized-notary/version/latest",
    cache: new InMemoryCache(),
  });

  const GET_ITEMS = gql`
    query {
      documentNotarizeds(first: 10) {
        id
        owner
        description
        documentHash
        timestamp
        transactionHash
        imageURI
        blockTimestamp
      }
    }
  `;

  const GET_REVOKED_ITEMS = gql`
    query GetRevokedItems($owner: String!) {
      documentRevokeds(where: { owner: $owner }) {
        blockTimestamp
        description
        documentHash
        id
        imageURI
        owner
        timestamp
        transactionHash
      }
    }
  `;

  const SEARCH_DOCUMENTS_BY_DESCRIPTION = gql`
    query SearchDocumentsByDescription($description: String!) {
      documentNotarizeds(where: { description_contains: $description }) {
        id
        owner
        description
        documentHash
        timestamp
        transactionHash
        imageURI
        blockTimestamp
      }
    }
  `;

  const SEARCH_DOCUMENTS_BY_OWNER = gql`
    query SearchDocumentsByOwner($owner: String!) {
      documentNotarizeds(where: { owner: $owner }) {
        id
        owner
        description
        documentHash
        timestamp
        transactionHash
        imageURI
        blockTimestamp
      }
    }
  `;

  useEffect(() => {
    client
      .query({ query: GET_ITEMS })
      .then(response => {
        setDocuments(response.data.documentNotarizeds);
      })
      .catch(error => {
        console.error("Error fetching notarized documents:", error);
      });

    if (address) {
      client
        .query({
          query: GET_REVOKED_ITEMS,
          variables: { owner: address.toString() },
        })
        .then(response => {
          setMyRevokedDocuments(response.data.documentRevokeds);
        })
        .catch(error => {
          console.error("Error fetching revoked documents:", error);
        });
    }
  }, [address]);

  const handleDescriptionSearch = () => {
    client
      .query({
        query: SEARCH_DOCUMENTS_BY_DESCRIPTION,
        variables: { description: descriptionSearchQuery },
      })
      .then(response => {
        setOwnerSearchResults([]);
        setDescriptionSearchResults(response.data.documentNotarizeds);
      })
      .catch(error => {
        console.error("Error searching documents by description:", error);
      });
  };

  const handleOwnerSearch = () => {
    client
      .query({
        query: SEARCH_DOCUMENTS_BY_OWNER,
        variables: { owner: ownerSearchQuery },
      })
      .then(response => {
        setDescriptionSearchResults([]);
        setOwnerSearchResults(response.data.documentNotarizeds);
      })
      .catch(error => {
        console.error("Error searching documents by owner:", error);
      });
  };

  return (
    <div className="container docs-wrapper mb-8">
      <div className="mb-5">
        <input
          type="text"
          placeholder="Search by description"
          value={descriptionSearchQuery}
          onChange={e => setDescriptionSearchQuery(e.target.value)}
          className="border text-white p-2 mr-2"
        />
        <button
          onClick={handleDescriptionSearch}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Search
        </button>
      </div>

      <div className="mb-5">
        <input
          type="text"
          placeholder="Search by owner address"
          value={ownerSearchQuery}
          onChange={e => setOwnerSearchQuery(e.target.value)}
          className="border text-white p-2 mr-2"
        />
        <button
          onClick={handleOwnerSearch}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Search
        </button>
      </div>

      {descriptionSearchResults.length > 0 && (
        <div>
          <h2 className="mb-5 docs-h2">Search Results by Description</h2>
          <div className="flex flex-wrap -mx-4">
            {descriptionSearchResults.map(document => (
              <div
                key={document.id}
                className="drop-shadow-2xl w-full md:w-1/3 p-4"
                style={{ color: "black", background: "transparent" }}
              >
                <div className="card shadow">
                  <Image
                    width={300}
                    height={300}
                    src={generateRandomImage(document.description)}
                    className="card-img-top image"
                    alt="Document"
                  />
                  <div className="card-body p-2" style={{ background: "beige" }}>
                    <h5 className="text-lg">Owner: {`${document.owner.slice(0, 6)}...${document.owner.slice(-4)}`}</h5>
                    <p className="text-gray-600">Description: {document.description}</p>
                    <p className="text-gray-600">
                      Timestamp: {new Date(Number(document.timestamp) * 1000).toLocaleString()}
                    </p>
                    <button
                      disabled
                      className="my-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ms-2"
                    >
                      Unauthorized to Download
                    </button>
                    <a
                      href={`https://explorer.celo.org/alfajores/tx/${document.transactionHash}`}
                      target="_blank"
                      className="my-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ms-2"
                    >
                      View on CELO explorer
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {ownerSearchResults.length > 0 && (
        <div>
          <h2 className="mb-5 docs-h2">Search Results by Owner</h2>
          <div className="flex flex-wrap -mx-4">
            {ownerSearchResults.map(document => (
              <div
                key={document.id}
                className="drop-shadow-2xl w-full md:w-1/3 p-4"
                style={{ color: "black", background: "transparent" }}
              >
                <div className="card shadow">
                  <Image
                    width={300}
                    height={300}
                    src={generateRandomImage(document.description)}
                    className="card-img-top image"
                    alt="Document"
                  />
                  <div className="card-body p-2" style={{ background: "beige" }}>
                    <h5 className="text-lg">Owner: {`${document.owner.slice(0, 6)}...${document.owner.slice(-4)}`}</h5>
                    <p className="text-gray-600">Description: {document.description}</p>
                    <p className="text-gray-600">
                      Timestamp: {new Date(Number(document.timestamp) * 1000).toLocaleString()}
                    </p>
                    <button
                      disabled
                      className="my-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ms-2"
                    >
                      Unauthorized to Download
                    </button>
                    <a
                      href={`https://explorer.celo.org/alfajores/tx/${document.transactionHash}`}
                      target="_blank"
                      className="my-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ms-2"
                    >
                      View on CELO explorer
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="mb-5 docs-h2">
        {myRevokedDocuments && myRevokedDocuments.length > 0 ? "My Revoked Documents" : ""}
      </h2>
      <div className="flex flex-wrap -mx-4">
        {myRevokedDocuments && myRevokedDocuments.length > 0 ? (
          myRevokedDocuments.map(document => (
            <div
              key={document.id}
              className="drop-shadow-2xl w-full md:w-1/3 p-4"
              style={{ color: "black", background: "transparent" }}
            >
              <div className="card shadow">
                <Image
                  width={300}
                  height={300}
                  src={generateRandomImage(document.description)}
                  className="card-img-top image"
                  alt="Document"
                />
                <div className="card-body p-2" style={{ background: "beige" }}>
                  <h5 className="text-lg">Owner: {`${document.owner.slice(0, 6)}...${document.owner.slice(-4)}`}</h5>
                  <p className="text-gray-600">Description: {document.description}</p>
                  <p className="text-gray-600">
                    Timestamp: {new Date(Number(document.timestamp) * 1000).toLocaleString()}
                  </p>
                  <button
                    disabled
                    className="my-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ms-2"
                  >
                    Not Available for Download
                  </button>
                  <a
                    href={`https://explorer.celo.org/alfajores/tx/${document.transactionHash}`}
                    target="_blank"
                    className="my-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ms-2"
                  >
                    View on CELO explorer
                  </a>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="docs-h2">You have no revoked documents</p>
        )}
      </div>

      <h2 className="mb-5 docs-h2">All Documents</h2>
      <div className="flex flex-wrap -mx-4">
        {documents && documents.length > 0 ? (
          documents.map(document => (
            <div
              key={document.id}
              className="drop-shadow-2xl w-full md:w-1/3 p-4"
              style={{ color: "black", background: "transparent" }}
            >
              <div className="card shadow">
                <Image
                  width={300}
                  height={300}
                  src={generateRandomImage(document.description)}
                  className="card-img-top image"
                  alt="Document"
                />
                <div className="card-body p-2" style={{ background: "beige" }}>
                  <h5 className="text-lg">Owner: {`${document.owner.slice(0, 6)}...${document.owner.slice(-4)}`}</h5>
                  <p className="text-gray-600">Description: {document.description}</p>
                  <p className="text-gray-600">
                    Timestamp: {new Date(Number(document.timestamp) * 1000).toLocaleString()}
                  </p>
                  <button
                    disabled
                    className="my-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ms-2"
                  >
                    Unauthorized to Download
                  </button>
                  <a
                    href={`https://explorer.celo.org/alfajores/tx/${document.transactionHash}`}
                    target="_blank"
                    className="my-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ms-2"
                  >
                    View on CELO explorer
                  </a>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="docs-h2">There are no documents available</p>
        )}
      </div>
    </div>
  );
};

export default ListAllNotary;
