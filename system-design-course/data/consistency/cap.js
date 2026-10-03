/* === Lesson cap - part of Module 9 (Consistency) ===
   Source: system-design-cheatsheet/09-consistency.html (#cap)
   + system-design-cheatsheet-course-hierarchy.md, Module 9.1.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["cap"] = {
  module: 9, num: "9.1", title: "CAP Theorem & PACELC",
  connectsFrom: "Caching (7.x) and Messaging (8.x) both quietly created second copies of the truth (a cached value, a read-model projection). This lesson names the theoretical ceiling on how \u201ccorrect\u201d those copies can simultaneously be.",
  tabs: {
    overview: {
      heading: "Pick 2 of 3, Then Pick Again",
      intro: "A distributed system can guarantee only <strong>2 of 3</strong>: Consistency, Availability, Partition Tolerance. Since partitions are a fact of networked life, the real choice is <strong>C vs A</strong> when one happens. <strong>PACELC</strong> goes further: even with no partition, you still trade <strong>Latency vs Consistency</strong> on every request.",
      cards: [
        { icon: "CA", title: "CA \u00b7 Consistent + Available", color: "teal", body: "Single DB, not distributed. No partition tolerance. <strong>Postgres, MySQL</strong> on a single node cannot gracefully survive a real partition." },
        { icon: "AP", title: "AP \u00b7 Available + Partition Tolerant", color: "orange", body: "Always responds, may serve stale data during a partition. <strong>Cassandra, DynamoDB, CouchDB</strong>." },
        { icon: "CP", title: "CP \u00b7 Consistent + Partition Tolerant", color: "purple", body: "Returns an error rather than risk an inconsistent answer. <strong>ZooKeeper, etcd, Spanner, HBase</strong>." }
      ],
      table: {
        headers: ["Type", "Trade-off", "Systems", "When Partition Happens"],
        rows: [
          ["<strong>CA</strong>", "No partition tolerance", "Single-node Postgres, MySQL", "N/A, not distributed"],
          ["<strong>AP</strong>", "Eventual consistency", "Cassandra, DynamoDB, CouchDB", "Serves stale data, resolves later"],
          ["<strong>CP</strong>", "Reduced availability", "ZooKeeper, etcd, Spanner, HBase", "Rejects requests until consistent"]
        ]
      },
      callouts: [
        { color: "green", label: "What each letter guarantees:", body: "<strong>C</strong>, all nodes see the same data (reads get the latest write). <strong>A</strong>, every request gets a non-error response. <strong>P</strong>, the system works despite network splits." },
        { color: "blue", label: "PACELC decision tree:", body: "If there is a <strong>Partition</strong> \u2192 choose <strong>Availability</strong> or <strong>Consistency</strong>. Else (no partition) \u2192 choose <strong>Latency</strong> or <strong>Consistency</strong>. Most real systems are tunable along this spectrum." }
      ]
    },
    realWorld: {
      heading: "The Three Approaches in Production",
      intro: "Every distributed datastore lands in one of three camps, and the label tells you exactly how it behaves when the network splits.",
      points: [
        { label: "CA (single-node SQL)", body: "Postgres and MySQL on one node are consistent and available, but a real partition has no graceful answer because there is nothing to partition across." },
        { label: "AP (always answer)", body: "Cassandra, DynamoDB, and CouchDB stay available during a partition and may serve stale data, reconciling it afterward via read repair and anti-entropy." },
        { label: "CP (refuse rather than lie)", body: "ZooKeeper, etcd, Spanner, and HBase reject requests on the minority side of a partition rather than risk returning an inconsistent value." }
      ]
    },
    tradeoffs: {
      heading: "The Real Choice Is CP vs AP",
      intro: "The classic \u201cpick 2 of 3\u201d framing hides where the actual decision lives.",
      points: [
        { label: "Partitions are unavoidable", body: "In a distributed system the network will split eventually, so the real choice is always <strong>CP vs AP</strong> during a partition. CA exists only for single-node systems." },
        { label: "Latency is a cost even without partitions", body: "PACELC's ELC branch says that when there is no partition you still pay for consistency in latency: a strongly consistent read waits for a quorum, a fast read may be stale." }
      ]
    },
    handsOn: {
      goal: "Prove the CP vs AP choice by injecting one network partition into a 3-node etcd cluster and a 3-node Cassandra cluster, then watching one refuse writes while the other accepts divergent ones.",
      stack: "etcd and Cassandra, 3 nodes each, in Docker on one user-defined network, partitioned with <code>docker network disconnect</code>. Local and free.",
      steps: [
        {
          title: "Start a 3-node etcd cluster (the CP system)",
          body: "One Docker network lets the nodes find each other by name.",
          code: "docker network create capnet\nCLUSTER=\"etcd1=http://etcd1:2380,etcd2=http://etcd2:2380,etcd3=http://etcd3:2380\"\nfor n in etcd1 etcd2 etcd3; do\n  docker run -d --name $n --network capnet quay.io/coreos/etcd:v3.5.9 etcd --name $n --advertise-client-urls http://$n:2379 --listen-client-urls http://0.0.0.0:2379 --initial-advertise-peer-urls http://$n:2380 --listen-peer-urls http://0.0.0.0:2380 --initial-cluster \"$CLUSTER\" --initial-cluster-state new --initial-cluster-token tkn\ndone",
          lang: "bash"
        },
        {
          title: "Partition one etcd node and write to the minority",
          body: "The isolated node loses quorum, so the write times out instead of returning a possibly stale answer.",
          code: "docker exec etcd1 etcdctl put foo bar\ndocker network disconnect capnet etcd3\n# the isolated minority node cannot reach a quorum: this fails\ndocker exec etcd3 etcdctl --command-timeout=3s put foo minority",
          lang: "bash"
        },
        {
          title: "Start a 3-node Cassandra cluster (the AP system)",
          body: "cass1 is the seed; give each node time to join before starting the next.",
          code: "docker run -d --name cass1 --network capnet -e CASSANDRA_CLUSTER_NAME=cap cassandra:4.1\nsleep 60\ndocker run -d --name cass2 --network capnet -e CASSANDRA_SEEDS=cass1 -e CASSANDRA_CLUSTER_NAME=cap cassandra:4.1\nsleep 60\ndocker run -d --name cass3 --network capnet -e CASSANDRA_SEEDS=cass1 -e CASSANDRA_CLUSTER_NAME=cap cassandra:4.1\nsleep 60\ndocker exec cass1 nodetool status",
          lang: "bash"
        },
        {
          title: "Create a replicated keyspace and table",
          code: "docker exec cass1 cqlsh -e \"CREATE KEYSPACE demo WITH replication = {'class':'SimpleStrategy','replication_factor':3};\"\ndocker exec cass1 cqlsh -e \"CREATE TABLE demo.kv (k text PRIMARY KEY, v text);\"",
          lang: "sql"
        },
        {
          title: "Partition one Cassandra node and write to both sides",
          body: "The majority side satisfies QUORUM and succeeds; the isolated node still accepts a write at consistency ONE, so the two sides now disagree.",
          code: "docker network disconnect capnet cass3\ndocker exec cass1 cqlsh -e \"CONSISTENCY QUORUM; INSERT INTO demo.kv (k,v) VALUES ('x','majority');\"\ndocker exec cass3 cqlsh -e \"CONSISTENCY ONE; INSERT INTO demo.kv (k,v) VALUES ('x','minority');\"",
          lang: "sql"
        }
      ],
      observe: "The etcd minority <code>put</code> times out and fails (CP: it refuses rather than accept an inconsistent write), while Cassandra accepts the QUORUM write on the majority and the ONE write on the isolated node, leaving two divergent values for key <code>x</code>. Same injected fault, opposite behaviors: that is the CP vs AP choice seen directly.",
      stretch: "Reconnect the isolated node (<code>docker network connect capnet cass3</code>), run <code>docker exec cass1 nodetool repair demo</code>, then read <code>x</code> at QUORUM and watch the divergent value reconcile via read repair and anti-entropy, a preview of 9.7's conflict resolution."
    }
  },
  keyTakeaways: [
    "During a partition you can keep <strong>Consistency</strong> or <strong>Availability</strong>, not both; since partitions are unavoidable, the practical decision is always <strong>CP vs AP</strong>.",
    "<strong>PACELC</strong> extends CAP: even with no partition (the ELC branch), every request trades <strong>Latency</strong> against <strong>Consistency</strong>.",
    "CA labels a single-node system (Postgres, MySQL); AP means always-answer with possible staleness (Cassandra, DynamoDB); CP means refuse rather than return a wrong value (etcd, ZooKeeper, Spanner)."
  ],
  proTip: "When someone calls a database \u201cCA,\u201d push back: unless it is a single node, the honest question is what it does during a partition, and the answer is always either CP or AP.",
  related: ["consistency-models", "consensus", "conflict-resolution", "replication", "clock-sync", "db-choice", "clocks", "replication-strategies", "multi-region", "graceful-degradation", "newsql", "nosql"],
  bridgeOut: "\u201cPick 2 of 3\u201d is an abstract law. The next lesson makes it concrete by naming the actual spectrum of consistency levels you can choose along that trade-off."
};
