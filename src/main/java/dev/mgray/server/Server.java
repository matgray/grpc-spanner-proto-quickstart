package dev.mgray.server;

import dev.mgray.customer.CustomerServiceImpl;
import io.grpc.ServerBuilder;
import io.grpc.netty.shaded.io.grpc.netty.NettyServerBuilder;
import java.io.IOException;
import java.net.InetSocketAddress;

public class Server {

  public static void main(String[] args) throws IOException, InterruptedException {
    int port = 8080;
    if (args.length > 0) {
      try {
        port = Integer.parseInt(args[0]);
      } catch (NumberFormatException e) {
        System.err.println("Usage: Server [port]");
        System.exit(1);
      }
    }

    io.grpc.Server server = NettyServerBuilder.forAddress(new InetSocketAddress("0.0.0.0", port))
        .addService(new CustomerServiceImpl())
        .addService(io.grpc.protobuf.services.ProtoReflectionService.newInstance())
        .build();

    server.start();
    System.out.println("Server started, listening on " + port);
    server.awaitTermination();
  }
}