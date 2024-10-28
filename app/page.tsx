"use client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useState } from "react";

interface ISelectProps {
  title: string;
  value: string;
}

interface IResponseData {
  date: string;
  title: string;
}

export default function Home() {
  const [data, setData] = useState<IResponseData[]>([]);
  const [options] = useState<ISelectProps[]>([
    {
      title: "sort by created at",
      value: "date",
    },
    {
      title: "sort by asc",
      value: "asc",
    },
    {
      title: "sort by desc",
      value: "desc",
    },
  ]);

  const onChange = async (item: string) => {
    const data = await fetch(`/api/csv?order=${item}&date=${item}`);
    const resp = await data.json();
    console.log("resp", resp);
    setData(resp.data as IResponseData[]);
  };

  return (
    <div className="flex flex-col w-full h-screen justify-center items-center p-4">
      <div className="w-[500px]">
        <Select onValueChange={(item) => onChange(item)}>
          <SelectTrigger className="w-full">
            Choose Sorting Options
          </SelectTrigger>
          <SelectContent>
            {options.map((item) => {
              return (
                <SelectItem value={item.value} key={item.value}>
                  {item.title}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <div className="grid grid-cols-2 mt-8 w-full gap-4">
          {data.length > 0 &&
            data.map((item, i) => {
              return (
                <Card key={i} className="p-2">
                  <CardContent className="p-0">
                    <div>{item.date}</div>
                    <div>{item.title}</div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </div>
    </div>
  );
}
