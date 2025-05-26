import { signIn } from "@/auth";

export default function SignIn() {
  return (
      <div className="space-y-4">
        <form
            action={async () => {
              "use server";
              await signIn("google");
            }}
        >
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Sign in with Google
          </button>
        </form>

        <form
            action={async () => {
              "use server";
              await signIn("github");
            }}
        >
          <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded">
            Sign in with GitHub
          </button>
        </form>
      </div>
  );
}
