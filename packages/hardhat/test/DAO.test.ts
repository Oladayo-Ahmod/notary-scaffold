import { expect } from "chai";
import { ethers } from "hardhat";
import { DAO } from "../typechain-types";

describe("Decentralized Autonomous Organisation", function () {
  // We define a fixture to reuse the same setup in every test.

  let contract: DAO;
  let stakeholder: any;
  let newStakeholder: any;
  let contributor: any;
  let beneficiary: any;
  let owner: any;

  beforeEach(async () => {
    [owner, stakeholder, contributor, beneficiary] = await ethers.getSigners();
    const contractFactory = await ethers.getContractFactory("DAO");
    contract = (await contractFactory.deploy()) as DAO;
    await contract.waitForDeployment();
  });

  describe("stakeholders and contributors", () => {
    it("should allow contributions and grant roles", async function () {
      await contract.connect(stakeholder).contribute({ value: ethers.parseEther("1") });
      await contract.connect(contributor).contribute({ value: ethers.parseEther("0.05") });
      expect(await contract.connect(stakeholder).isStakeholder()).to.be.true;
      expect(await contract.connect(contributor).isContributor()).to.be.true;
      expect(await contract.getContractBalance()).to.equal(ethers.parseEther("1.05"));
    });

    it("should create a proposal", async function () {
      await contract.connect(stakeholder).contribute({ value: ethers.parseEther("0.1") });
      await contract
        .connect(stakeholder)
        .createProposal("Test Proposal", "Test Description", beneficiary.address, ethers.parseEther("0.05"));
      const proposal = await contract.getProposalByID(0);
      expect(proposal.title).to.equal("Test Proposal");
      expect(proposal.description).to.equal("Test Description");
      expect(proposal.requestedAmount).to.equal(ethers.parseEther("0.05"));
    });

    it("should allow voting on a proposal", async function () {
      await contract.connect(stakeholder).contribute({ value: ethers.parseEther("0.1") });
      await contract
        .connect(stakeholder)
        .createProposal("Test Proposal", "Test Description", beneficiary.address, ethers.parseEther("0.05"));

      await contract.connect(stakeholder).contribute({ value: ethers.parseEther("0.1") });
      await contract.connect(stakeholder).voteOnProposal(0, true);

      const proposal = await contract.getProposalByID(0);
      expect(proposal.upVotes).to.equal(1);
    });

    it("should execute payment if proposal is approved", async function () {
      await contract.connect(stakeholder).contribute({ value: ethers.parseEther("0.1") });
      await contract
        .connect(stakeholder)
        .createProposal("Test Proposal", "Test Description", beneficiary.address, ethers.parseEther("0.05"));

      await contract.connect(newStakeholder).contribute({ value: ethers.parseEther("0.1") });
      await contract.connect(newStakeholder).voteOnProposal(0, true);

      await ethers.provider.send("evm_increaseTime", [5 * 60]); // Increase time to pass voting period
      await ethers.provider.send("evm_mine", []); // Mine the next block

      await contract.connect(owner).executePayment(0);

      const proposal = await contract.getProposalByID(0);
      expect(proposal.fundsPaid).to.be.true;
    });
  });
});
