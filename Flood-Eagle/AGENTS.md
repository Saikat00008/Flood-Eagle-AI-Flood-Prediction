<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep Flood Eagle weather parsing and flood-risk calculation in one shared module so the forecast, map, and current conditions stay consistent.
- Keep historical flood stories and public flood-preparedness guidance in separate components under `src/components/`; these editorial sections remain independent of live weather fetching.
