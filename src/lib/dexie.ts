import Dexie, { Table } from "dexie";

interface DEX_Tread {
  id: string;
  title: string;
  created_at: Date;
  updated_at: Date;
}

interface DEX_Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  thought: string;
  created_at: Date;
  updated_at: Date;
  thread_id: string;
}

class ChatDB extends Dexie {
  threads!: Table<DEX_Tread>;
  messages!: Table<DEX_Message>;

  constructor() {
    super("chatdb");

    this.version(1).stores({
      threads: "id, title, created_at, updated_at",
      messages: "id, role, content, thought, created_at, updated_at, thread_id",
    });

    this.threads.hook("creating", (_, obj) => {
      obj.created_at = new Date();
      obj.updated_at = new Date();
    });

    this.messages.hook("creating", (_, obj) => [
      obj.created_at = new Date(),
    ])
  }

  async createThread(title: string) {
    const id = crypto.randomUUID();

    await this.threads.add({
      id,
      title,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return id;
  }
  async getAllThreads() {
    return this.threads.reverse().sortBy("updated_at");
  }
  async createMessage(
    messsage: Pick<DEX_Message, "content" | "role" | "thread_id" | "thought" >
  ) {
    const messsageId = crypto.randomUUID();

    await this.transaction("rw", [this.threads, this.messages], async () => {
      await this.messages.add({
        ...messsage,
        id: messsageId,
        created_at: new Date(),
        updated_at: new Date(),
      });

      await this.messages.update( messsage.thread_id, {
        updated_at: new Date()
      })
    });
    return messsageId;
  }
}

export const db = new ChatDB();
