'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, LoginSchema } from "@/lib/schemas/zod.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { PulseLoader } from "react-spinners";
import { toast } from "../ui/use-toast";
import { login } from "@/lib/actions/user.actions";
import { AppDispatch } from "@/lib/redux/redux.config";
import { setTokens } from "@/lib/redux/authSlice";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setAuthCookies } from "@/lib/utils/cookies.utils";

export default function LoginForm() {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginSchema) {
    setIsLoading(true);

    try {
      const tokens: { accessToken: string, refreshToken: string } = await login(data);
      if (tokens.accessToken && tokens.refreshToken) {
        dispatch(setTokens(tokens));
        setAuthCookies(tokens.accessToken, tokens.refreshToken);

        toast({ description: "Login success!" });
        router.push("/account");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Oops! Something went wrong!", description: String(error) });
      form.setValue("password", "");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <Form {...form}>
        <form className="flex flex-col w-fit gap-3 border rounded-xl p-6"
          onSubmit={form.handleSubmit(onSubmit)}
          method="POST"
        >
          <h1 className="text-center">LOGIN</h1>

          <FormField control={form.control} name="username" render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input className="w-[25em]" type="text" required {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input className="w-[25em]" type="password" required {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <Button className="w-fit self-center dark:bg-green-700 dark:hover:bg-green-600 bg-green-400 hover:bg-green-500"
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? (
              <PulseLoader color="#22c55e" size={15} speedMultiplier={0.8} />
            ) : (
              <p>Login</p>
            )}
          </Button>

          <div className="flex flex-row gap-1 self-center">
            <p>Don't have an account?</p>
            <Link className="text-blue-500 underline dark:hover:text-white hover:text-black"
              href={"/account/register"}
            >
              Register!
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
