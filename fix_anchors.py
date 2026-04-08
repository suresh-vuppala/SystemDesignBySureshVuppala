#!/usr/bin/env python3
import re

with open('CheatSheet.md', 'r', encoding='utf-8') as f:
    content = f.read()

# Define anchor mappings
mappings = {
    '### SQL (Relational DB)': '### SQL (Relational DB) {#sql}',
    '### NoSQL': '### NoSQL {#nosql}',
    '### NewSQL': '### NewSQL {#newsql}',
    '### Time-Series DB': '### Time-Series DB {#timeseries}',
    '### Search Engine (Elasticsearch / Solr)': '### Search Engine (Elasticsearch / Solr) {#search}',
    '###  TCP/UDP': '###  TCP/UDP {#tcpudp}',
    '###  HTTP/HTTPS': '###  HTTP/HTTPS {#httphttps}',
    '###  Authentication': '###  Authentication {#authentication}',
    '###  Authorization': '###  Authorization {#authorization}',
    '###  Change Data Capture (CDC)': '###  Change Data Capture (CDC) {#cdc}',
    '###  Fault Tolerance & Reliability': '###  Fault Tolerance & Reliability {#fault-tolerance}',
    '###  REST API': '###  REST API {#rest}',
    '###  gRPC': '###  gRPC {#grpc}',
    '###  GraphQL': '###  GraphQL {#graphql}',
    '###  Real-time Communication': '###  Real-time Communication {#realtime}',
    '###  Caching': '###  Caching {#caching}',
    '###  Redis': '###  Redis {#redis}',
    '###  CDN': '###  CDN {#cdn}',
    '###  Message Queue (RabbitMQ / SQS)': '###  Message Queue (RabbitMQ / SQS) {#messagequeues}',
    '###  Apache Kafka': '###  Apache Kafka {#kafka}',
    '###  Pub/Sub (Google Pub/Sub / SNS)': '###  Pub/Sub (Google Pub/Sub / SNS) {#pubsub}',
    '###  Microservices': '###  Microservices {#microservices}',
    '###  Serverless': '###  Serverless {#serverless}',
    '###  Service Mesh': '###  Service Mesh {#servicemesh}',
    '###  Load Balancer': '###  Load Balancer {#loadbalancer}',
    '###  API Gateway': '###  API Gateway {#apigateway}',
    '###  Forward & Reverse Proxy': '###  Forward & Reverse Proxy {#proxy}',
    '###  CAP Theorem': '###  CAP Theorem {#cap}',
    '###  Consistency Models': '###  Consistency Models {#consistency}',
    '###  Concurrency Control': '###  Concurrency Control {#concurrency}',
    '###  Distributed Transactions': '###  Distributed Transactions {#transactions}',
    '###  Sharding': '###  Sharding {#sharding}',
    '###  Replication': '###  Replication {#replication}',
    '###  Rate Limiting': '###  Rate Limiting {#ratelimit}',
    '###  Bloom Filters': '###  Bloom Filters {#bloomfilters}',
    '###  Circuit Breaker': '###  Circuit Breaker {#circuitbreaker}',
    '###  Blob Storage (S3 / GCS)': '###  Blob Storage (S3 / GCS) {#blobstorage}',
    '###  DNS': '###  DNS {#dns}',
    '###  Data Warehouse': '###  Data Warehouse {#warehouse}',
}

count = 0
for old, new in mappings.items():
    if old in content:
        content = content.replace(old, new)
        count += 1
        print(f"✓ Added anchor: {old} -> {new.split('{')[1].split('}')[0]}")

with open('CheatSheet.md', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\n✓ Total anchors added: {count}")
