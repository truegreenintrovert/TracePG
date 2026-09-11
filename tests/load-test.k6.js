import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "2m", target: 250 },
    { duration: "2m", target: 500 },
    { duration: "3m", target: 1000 },
    { duration: "10m", target: 1000 },
    { duration: "2m", target: 0 },
  ],
};

export default function () {
  const response = http.get("https://tracepg.com/");

  check(response, {
    "status is 200": (r) => r.status === 200,
    "response is under 2 seconds": (r) => r.timings.duration < 2000,
  });

  sleep(1);
}
