import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** The TCP three-way handshake plus teardown — colocated per the
 *  interactive system's authoring convention for nested step data. */
export const tcpLifecycleSteps: StepFlowStep[] = [
  {
    actor: "Client",
    title: "SYN",
    description:
      "The client picks a random initial sequence number and sends a segment with the SYN flag set, proposing to start a connection.",
    detail: "Client -> Server\nflags: SYN\nseq: 1000",
  },
  {
    actor: "Server",
    title: "SYN-ACK",
    description:
      "The server acknowledges the client's sequence number (seq+1) and sends its own SYN with its own random initial sequence number, proposing the connection back.",
    detail: "Server -> Client\nflags: SYN, ACK\nseq: 5000  ack: 1001",
  },
  {
    actor: "Client",
    title: "ACK",
    description:
      "The client acknowledges the server's sequence number. Both sides have now confirmed they can send AND receive — the connection is established.",
    detail: "Client -> Server\nflags: ACK\nseq: 1001  ack: 5001",
  },
  {
    actor: "Both",
    title: "Data transfer",
    description:
      "With the connection open, both sides exchange data in segments, each one acknowledged by sequence number. If a segment's ACK doesn't arrive in time, TCP retransmits it — this is what makes TCP reliable, unlike UDP.",
  },
  {
    actor: "Client",
    title: "FIN",
    description:
      "When the client is done sending, it sends a segment with the FIN flag — \"I have no more data for you,\" not \"close immediately.\" The connection can still receive data from the server after this.",
    detail: "Client -> Server\nflags: FIN\nseq: 2000",
  },
  {
    actor: "Server",
    title: "ACK, then FIN, then ACK",
    description:
      "The server acknowledges the client's FIN, finishes sending anything it still had, then sends its own FIN. The client ACKs that, and only then do both sides release the connection — a four-step teardown mirroring the three-step setup.",
    detail: "Server -> Client: ACK\nServer -> Client: FIN\nClient -> Server: ACK",
  },
];
