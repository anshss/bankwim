// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTMinter is ERC721 {

    uint public _tokenId;
    mapping(uint => string) private _tokenURIs;

    constructor() ERC721("Test Nft", "ITM") {}

    function mintMe(string memory tokenURI) public {
        ++_tokenId;
        _mint(msg.sender, _tokenId);
        _setTokenURI(_tokenId, tokenURI);
    }

    function mintAddress(address _address, string memory tokenURI) public {
        ++_tokenId;
        _mint(_address, _tokenId);
        _setTokenURI(_tokenId, tokenURI);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }

    function _setTokenURI(uint256 tokenId, string memory uri) internal {
        _tokenURIs[tokenId] = uri;
    }
}
