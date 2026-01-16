import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { BlockchainService } from "./blockchain.service";

@ApiTags("Blockchain")
@Controller("blockchain")
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  // GET /blockchain/value
  @Get("value")
  @ApiOperation({ summary: "Get latest value from smart contract" })
  @ApiResponse({
    status: 200,
    description: "Latest stored value",
    schema: {
      example: { value: "99" },
    },
  })
  async getValue() {
    return this.blockchainService.getLatestValue();
  }

  // GET /blockchain/events
  @Get("events")
  @ApiOperation({ summary: "Get ValueUpdated events" })
  @ApiResponse({
    status: 200,
    description: "List of ValueUpdated events",
    schema: {
      example: [
        {
          blockNumber: "123456",
          value: "99",
        },
      ],
    },
  })
  async getEvents() {
    return this.blockchainService.getValueUpdatedEvents();
  }
}
