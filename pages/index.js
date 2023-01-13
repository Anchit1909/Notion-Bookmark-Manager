import { Client } from "@notionhq/client";
import { useEffect, useState } from "react";
import MainScreen from "./MainScreen";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark } from "@fortawesome/free-solid-svg-icons";

export default function Home() {
  const [pageData, setPageData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  async function saveBookmarkToNotion(bookmark) {
    const notion = new Client({
      auth: process.env.NEXT_PUBLIC_NOTION_API_TOKEN,
    });

    try {
      await notion.pages.create({
        parent: {
          database_id: process.env.NEXT_PUBLIC_NOTION_DATABASE_ID,
        },
        properties: {
          Title: {
            title: [
              {
                text: {
                  content: bookmark.title,
                },
              },
            ],
          },
          URL: {
            url: bookmark.url,
          },
          Tags: {
            multi_select: bookmark.tags,
          },
          Notes: {
            rich_text: [
              {
                text: {
                  content: bookmark.notes || "-",
                },
              },
            ],
          },
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSaving(true);

    const data = new FormData(e.target);
    const bookmark = Object.fromEntries(data.entries());

    bookmark.tags = bookmark.tags
      .split(",")
      .filter((tag) => tag.trim().length !== 0)
      .map((tag) => ({
        name: tag.trim(),
      }));

    const result = await saveBookmarkToNotion(bookmark);

    if (result) {
      setIsSaved(true);
    } else {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    chrome.tabs &&
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0].url;
        const title = tabs[0].title;
        setPageData({ url, title });
      });
  }, []);
  return (
    <section className="bg-gray-900 w-80">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="mb-4">
          <div className="flex items-center justify-center mb-2">
            <FontAwesomeIcon icon={faBookmark} color="#22C55E" size="3x" />
          </div>
          <div className="flex items-center flex-col">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Notion Bookmark
            </h1>
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white mb-2">
              Manager
            </h1>
          </div>
          <div className="flex items-center flex-col">
            <h2 className="text-[#8896AB] font-medium">
              Save Bookmarks directly to your
            </h2>
            <h2 className="text-[#8896AB]">Notion database</h2>
          </div>
        </div>
        <div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
            <div>
              {isSaved ? (
                <span>Saved</span>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 md:space-y-6"
                >
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Title
                    </label>
                    <input
                      name="title"
                      type="text"
                      defaultValue={pageData.title}
                      title={pageData.title}
                      required
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      URL
                    </label>
                    <input
                      name="url"
                      type="url"
                      defaultValue={pageData.url}
                      title={pageData.url}
                      required
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Tags
                    </label>
                    <input
                      name="tags"
                      type="text"
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Separate tags with commas"
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                    >
                      {isSaving ? <span>Saving</span> : <span>Save</span>}
                    </button>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-center">
                      Visit <span className="text-[#22C55E]">Bookmarks</span>
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
