import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/require-user";
import { ChatView, type MessageItem, type ChatUser } from "./ChatView";
import { getChatMessages, getColleagues } from "./actions";

export default async function ChatPage() {
  const user = await requireUser();

  const [initialMessages, colleagues] = await Promise.all([
    getChatMessages({ channel: "GENERAL" }),
    getColleagues(),
  ]);

  return (
    <AppShell user={user} titleKey="chat">
      <ChatView
        currentUser={{
          id: user.id,
          fullName: user.fullName,
          role: user.role,
        }}
        colleagues={colleagues as ChatUser[]}
        initialMessages={initialMessages as MessageItem[]}
      />
    </AppShell>
  );
}
