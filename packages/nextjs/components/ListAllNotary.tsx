"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
// Import Apollo Client and necessary utilities from the Apollo package
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import useDownloader from "react-use-downloader";

interface NotaryDocument {
  // Define the structure of a Notary Document
  id: string;
  owner: string;
  description: string;
  documentHash: string;
  timestamp: string;
  transactionHash: string;
}
const ListAllNotary = () => {
  const [documents, setDocuments] = useState<NotaryDocument[]>([]);

  // Function to generate a random image URL with a unique seed based on the notary description
  const generateRandomImage = (title: string) => {
    const width = 400; // Define image width
    const height = 300; // Define image height
    const seed = title.replace(/\s+/g, "-").toLowerCase(); // Generate seed from title
    return `https://picsum.photos/seed/${seed}/${width}/${height}`; // Return generated image URL
  };

  // Initialize the Apollo Client with the Subgraph endpoint and an in-memory cache
  const client = new ApolloClient({
    uri: "https://api.studio.thegraph.com/query/76464/decentralized-notary/version/latest",
    cache: new InMemoryCache(),
  });

  // Define the GraphQL query to fetch notarized documents
  const GET_ITEMS = gql`
    query {
      documentNotarizeds(first: 10) {
        id
        owner
        description
        documentHash
        timestamp
        transactionHash
      }
    }
  `;

  // Execute the query to fetch data from the Subgraph
  client
    .query({
      query: GET_ITEMS, // Specify the query to be executed
    })
    .then(response => {
      // Handle the successful response
      setDocuments(response.data.documentNotarizeds); // Update the state with the fetched documents
    })
    .catch(error => {
      // Handle any errors that occur during the query execution
      console.error("Error fetching data:", error);
    });

  return (
    <div className="container docs-wrapper mb-8">
      <h2 className="mb-5 docs-h2 ">All Documents</h2>
      <div className="flex flex-wrap -mx-4">
        {/* Check if documents array exists and has elements before mapping */}
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
                  {/* Display document owner */}
                  <h5 className=" text-lg">Owner: {`${document.owner.slice(0, 6)}...${document.owner.slice(-4)}`}</h5>
                  {/* Display document description */}
                  <p className="text-gray-600">Description: {document.description}</p>
                  {/* Display document timestamp */}
                  <p className="text-gray-600">
                    Timestamp: {new Date(Number(document.timestamp) * 1000).toLocaleString()}
                  </p>
                  {/* Button to download the document */}
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
          <p className="docs-h2">There are no documents dvailable</p>
        )}
      </div>
    </div>
  );
};

export default ListAllNotary;
